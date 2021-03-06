/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
 * Licensed under the MIT License. See LICENSE.md in the project root for license terms.
 *--------------------------------------------------------------------------------------------*/
import {
  Id64Array,
  Id64String,
  IModelStatus,
  Logger,
} from "@bentley/bentleyjs-core";
import {
  BackgroundMapType,
  Camera,
  Code,
  IModel,
  RenderMode,
  ViewStateProps,
  ViewQueryParams,
  IModelReadRpcInterface,
  ViewDefinition3dProps,
  CategorySelectorProps,
  ModelSelectorProps,
  ViewDefinitionProps,
  DisplayStyle3dProps,
  CameraProps,
  IModelError,
} from "@bentley/imodeljs-common";
import {
  Environment,
  IModelConnection,
  SpatialViewState,
  ViewState,
  StandardViewId,
  loggerCategory,
} from "@bentley/imodeljs-frontend";
import { Range3d } from "@bentley/geometry-core";

/**@beta Interface providing options for 3D view creation. */
export interface ViewCreator3dOptions {
  /** Turn camera on when generating view */
  cameraOn?: boolean;
  /** Turn skybox on when generating view */
  skyboxOn?: boolean;
  /** Standard view id for the view state */
  standardViewId?: StandardViewId;
  /** Marge in Props from seed view (default spatial view) in iModel  */
  useSeedView?: boolean;
  /** vpAspect aspect ratio of vp to create fit view. */
  vpAspect?: number;
}

/**@beta API for creating a 3D default view for an iModel. */
export class ViewCreator3d {
  /**
   * Constructs ViewCreator with iModelConnection.
   * @param _imodel IModelConnection to query for categories and/or models
   */
  constructor(private _imodel: IModelConnection) {}

  /**
   * Creates a default view based on the given model ids. Uses all models ON if no modelIds passed
   * @param options for view creation
   * @param modelIds [optional] Model Ids to use in the view
   * @throws [[IModelError]] if no physical models are found.
   */
  public async createDefaultView(
    options?: ViewCreator3dOptions,
    modelIds?: string[]
  ): Promise<ViewState> {
    const models = modelIds ? modelIds : await this._getAllModels();
    if (models === undefined || models.length === 0)
      throw new IModelError(
        IModelStatus.BadModel,
        "ViewCreator3d.createDefaultView: no physical models found in iModel",
        Logger.logError,
        loggerCategory,
        () => ({ models })
      );

    const props = await this._createViewStateProps(models, options);
    const viewState = SpatialViewState.createFromProps(
      props,
      this._imodel
    ) as SpatialViewState;
    await viewState.load();

    const hasBackgroundMapProps =
      viewState.displayStyle.toJSON().jsonProperties &&
      viewState.displayStyle.toJSON().jsonProperties.styles.backgroundMap;
    if (viewState.viewFlags.backgroundMap && !hasBackgroundMapProps) {
      viewState.getDisplayStyle3d().changeBackgroundMapProps({
        providerName: "BingProvider",
        providerData: {
          mapType: BackgroundMapType.Hybrid,
        },
      });
    }
    if (options?.standardViewId)
      viewState.setStandardRotation(options.standardViewId);
    const range = viewState.computeFitRange();
    viewState.lookAtVolume(range, options?.vpAspect);

    return viewState;
  }

  /**
   * Generates a view state props object for creating a view. Merges display styles with a seed view if the NavigatorApp.flags.useSeedView is ON
   * @param models Models to put in view props
   * @param options view creation options like camera On and skybox On
   */
  private async _createViewStateProps(
    models: Id64String[],
    options?: ViewCreator3dOptions
  ): Promise<ViewStateProps> {
    // Use dictionary model in all props
    const dictionaryId = IModel.dictionaryId;
    const categories: Id64Array = await this._getAllCategories();

    // model extents
    const modelProps = await this._imodel.models.queryModelRanges(models);
    const modelExtents = Range3d.fromJSON(modelProps[0]);
    let originX = modelExtents.low.x;
    let originY = modelExtents.low.y;
    let originZ = modelExtents.low.z;
    let deltaX = modelExtents.xLength();
    let deltaY = modelExtents.yLength();
    let deltaZ = modelExtents.zLength();

    // if vp aspect given, update model extents to fit view
    if (options?.vpAspect) {
      const modelAspect = deltaY / deltaX;

      if (modelAspect > options.vpAspect) {
        const xFix = deltaY / options.vpAspect;
        originX = originX - xFix / 2;
        deltaX = deltaX + xFix;
      } else if (modelAspect < options.vpAspect) {
        const yFix = deltaX * options.vpAspect;
        originY = originY - yFix / 2;
        deltaY = deltaY + yFix;
      }
    }

    const categorySelectorProps: CategorySelectorProps = {
      categories,
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:CategorySelector",
    };

    const modelSelectorProps: ModelSelectorProps = {
      models,
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:ModelSelector",
    };

    const cameraData = new Camera();
    const cameraOn = options?.cameraOn ? options.cameraOn : false;
    let c = Code.createEmpty();
    c.value = "MyView2020";
    const viewDefinitionProps: ViewDefinition3dProps = {
      categorySelectorId: "",
      displayStyleId: "",
      code: c,
      model: dictionaryId,
      origin: { x: originX, y: originY, z: originZ },
      extents: { x: deltaX, y: deltaY, z: deltaZ },
      classFullName: "BisCore:SpatialViewDefinition",
      cameraOn,
      camera: {
        lens: cameraData.lens.toJSON(),
        focusDist: cameraData.focusDist,
        eye: cameraData.eye.toJSON(),
      },
    };

    const displayStyleProps: DisplayStyle3dProps = {
      code: Code.createEmpty(),
      model: dictionaryId,
      classFullName: "BisCore:DisplayStyle",
      jsonProperties: {
        styles: {
          viewflags: {
            renderMode: RenderMode.SmoothShade,
            noSourceLights: false,
            noCameraLights: false,
            noSolarLight: false,
            noConstruct: true,
            noTransp: false,
            visEdges: false,
            backgroundMap: this._imodel.isGeoLocated,
          },
          environment:
            options !== undefined &&
            options.skyboxOn !== undefined &&
            options.skyboxOn
              ? new Environment({ sky: { display: true } }).toJSON()
              : undefined,
        },
      },
    };

    const viewStateProps: ViewStateProps = {
      displayStyleProps,
      categorySelectorProps,
      modelSelectorProps,
      viewDefinitionProps,
    };

    // merge seed view props if needed
    return options?.useSeedView
      ? this._mergeSeedView(viewStateProps)
      : viewStateProps;
  }

  /**
   * Merges a seed view in the iModel with the passed view state props. It will be a no-op if there are no default 3D views in the iModel
   * @param viewStateProps Input view props to be merged
   */
  private async _mergeSeedView(
    viewStateProps: ViewStateProps
  ): Promise<ViewStateProps> {
    const viewId = await this._getDefaultViewId();
    // Handle iModels without any default view id
    if (viewId === undefined) return viewStateProps;

    const seedViewState = (await this._imodel.views.load(
      viewId
    )) as SpatialViewState;
    const seedViewStateProps = {
      categorySelectorProps: seedViewState.categorySelector.toJSON(),
      modelSelectorProps: seedViewState.modelSelector.toJSON(),
      viewDefinitionProps: seedViewState.toJSON(),
      displayStyleProps: seedViewState.displayStyle.toJSON(),
    };
    const mergedDisplayProps = seedViewStateProps.displayStyleProps;
    if (mergedDisplayProps.jsonProperties !== undefined) {
      mergedDisplayProps.jsonProperties.styles = {
        ...mergedDisplayProps.jsonProperties.styles,
        ...viewStateProps.displayStyleProps.jsonProperties!.styles,
      };
    }

    return {
      ...seedViewStateProps,
      ...viewStateProps,
      displayStyleProps: mergedDisplayProps,
    };
  }

  /**
   * Get ID of default view.
   */
  private async _getDefaultViewId(): Promise<Id64String | undefined> {
    const viewId = await this._imodel.views.queryDefaultViewId();
    const params: ViewQueryParams = {};
    params.from = SpatialViewState.classFullName;
    params.where = "ECInstanceId=" + viewId;

    // Check validity of default view
    const viewProps = await IModelReadRpcInterface.getClient().queryElementProps(
      this._imodel.getRpcProps(),
      params
    );
    if (viewProps.length === 0) {
      // Return the first view we can find
      const viewList = await this._imodel.views.getViewList({
        wantPrivate: false,
      });
      if (viewList.length === 0) return undefined;

      const spatialViewList = viewList.filter(
        (value: IModelConnection.ViewSpec) =>
          value.class.indexOf("Spatial") !== -1
      );
      if (spatialViewList.length === 0) return undefined;

      return spatialViewList[0].id;
    }

    return viewId;
  }

  /**
   * Get all categories containing elements
   */
  private async _getAllCategories(): Promise<Id64Array> {
    // Only use categories with elements in them
    const selectUsedSpatialCategoryIds = `SELECT DISTINCT Category.Id as id FROM BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId FROM BisCore.SpatialCategory)`;
    const categories: Id64Array = await this._executeQuery(
      selectUsedSpatialCategoryIds
    );

    return categories;
  }

  /**
   * Get all PhysicalModel ids in the connection
   */
  private async _getAllModels(): Promise<Id64Array> {
    const query =
      "SELECT p.ECInstanceId id, p.Parent.Id subjectId FROM bis.InformationPartitionElement p JOIN bis.Model m ON m.ModeledElement.Id = p.ECInstanceId WHERE NOT m.IsPrivate";
    const models: Id64Array = await this._executeQuery(query);

    return models;
  }

  /**
   * Helper function to execute ECSql queries.
   */
  private _executeQuery = async (query: string) => {
    const rows = [];
    for await (const row of this._imodel.query(query)) rows.push(row.id);

    return rows;
  };
}
