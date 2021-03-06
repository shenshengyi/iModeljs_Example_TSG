/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import {
  Backstage,
  ConfigurableUiManager,
  FrontstageManager,
  SyncUiEventDispatcher,
  UiFramework,
  ContentLayoutProps,
} from "@bentley/ui-framework";
import { SampleFrontstage } from "./frontstages/SampleFrontstage";
import { SampleFrontstage2 } from "./frontstages/SampleFrontstage2";
import { TestFeatureStage } from "./frontstages/TestFeaturestage";
import { ViewsFrontstage, LoadingStage } from "./frontstages/ViewsFrontstage";
import { UIViewportFrontstage } from "./frontstages/UIViewFrontstage";
import { IModelIndexStage } from "../MyStage/IModelIndexStage";
import { TableFrontstage } from "./frontstages/TableStage";
import { TreeFrontstage } from "./frontstages/TreeStage";
import { SavedViewFrontstage1 } from "./frontstages/SavedViewStage";

/**
 * Example Ui Configuration for an iModel.js App
import { IModelIndexStage } from "../MyStage/IModelIndexStage";
 */
export class AppUi {
  // Initialize the ConfigurableUiManager
  public static initialize() {
    ConfigurableUiManager.initialize();
    ConfigurableUiManager.loadContentLayouts(this.getContentLayouts());
  }
  private static getContentLayouts(): ContentLayoutProps[] {
    const singleContent: ContentLayoutProps = {
      id: "SingleContent",
      descriptionKey: "NavigatorApp:ContentDef.OneView",
      priority: 100,
    };
    const contentLayouts: ContentLayoutProps[] = [];
    contentLayouts.push(singleContent);
    return contentLayouts;
  }
  // Command that toggles the backstage
  public static get backstageToggleCommand() {
    return Backstage.backstageToggleCommand;
  }

  /** Handle when an iModel and the views have been selected  */
  public static handleIModelViewsSelected(
    iModelConnection: IModelConnection,
    viewStates: ViewState[]
  ): void {
    // Set the iModelConnection in the Redux store
    UiFramework.setIModelConnection(iModelConnection);
    UiFramework.setDefaultViewState(viewStates[0]);

    // Tell the SyncUiEventDispatcher about the iModelConnection
    SyncUiEventDispatcher.initializeConnectionEvents(iModelConnection);

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider = new SampleFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider);

    // tslint:disable-next-line:no-floating-promises
    FrontstageManager.setActiveFrontstageDef(
      frontstageProvider.frontstageDef
    ).then(() => {
      // Frontstage is ready
    });

    // We create a FrontStage that contains the views that we want.
    const frontstageProvider2 = new SampleFrontstage2(viewStates);
    FrontstageManager.addFrontstageProvider(frontstageProvider2);

    const testFeature = new TestFeatureStage(viewStates);
    FrontstageManager.addFrontstageProvider(testFeature);

    const viewFeature = new ViewsFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(viewFeature);

    const loadStage = new LoadingStage();
    FrontstageManager.addFrontstageProvider(loadStage);

    const uiStage = new UIViewportFrontstage();
    FrontstageManager.addFrontstageProvider(uiStage);

    const modl = new IModelIndexStage();
    FrontstageManager.addFrontstageProvider(modl);

    const table = new TableFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(table);

    const tree = new TreeFrontstage(viewStates);
    FrontstageManager.addFrontstageProvider(tree);
    const savedView = new SavedViewFrontstage1(viewStates);
    FrontstageManager.addFrontstageProvider(savedView);
  }
}
