import {
  FrontstageProvider,
  ContentGroup,
  IModelViewportControl,
  UiFramework,
  Frontstage,
  CoreTools,
  ContentLayoutDef,
  ContentProps,
  Widget,
  WidgetState,
  FrontstageProps,
  Zone,
  ZoneState,
  WidgetControl,
  ConfigurableCreateInfo,
  DefaultNavigationWidget,
  ToolWidget,
  ItemList,
  ViewportContentControl,
  ConfigurableUiManager,
  BasicNavigationWidget,
  SpatialContainmentTree,
  ModelsTreeSelectionPredicate,
  ViewSelector,
  CustomItemDef,
  StatusBarWidgetControlArgs,
  StatusBarItemUtilities,
  withStatusFieldProps,
  StatusBarItem,
  StatusBarWidgetControl,
  StatusBarComposer,
  SelectionInfoField,
  TileLoadingIndicator,
  SelectionScopeField,
  ViewAttributesStatusField,
  ContentViewManager,
  FrontstageManager,
  ContentControlActivatedEventArgs,
  ContentControl,
  StatusFieldProps,
  IModelConnectedNavigationWidget,
  IModelConnectedViewSelector,
} from "@bentley/ui-framework";
import React from "react";
import {
  ViewState,
  IModelApp,
  ScreenViewport,
  TwoWayViewportSync,
  IModelConnection,
  Viewport,
  DisplayStyle2dState,
  DisplayStyle3dState,
  DisplayStyleState,
} from "@bentley/imodeljs-frontend";
import { NavigatorTools } from "../tools/NavigatorTools";
import {
  ViewportComponent,
  SelectionMode,
  SelectableContent,
  SimplePropertyDataProvider,
  PropertyGrid,
  PropertyCategory,
  PropertyUpdatedArgs,
} from "@bentley/ui-components";
import { TestFeature } from "./Features";
import { AppUi } from "../AppUi";
import { viewWithUnifiedSelection } from "@bentley/presentation-components";
import { AccessToken } from "@bentley/itwin-client";
import {
  StatusBarSection,
  StandardTypeNames,
  StandardEditorNames,
  PropertyRecord,
  PropertyValueFormat,
  PrimitiveValue,
  PropertyDescription,
  PropertyValue,
} from "@bentley/ui-abstract";
// import { IModelContentTree } from "@bentley/imodel-content-tree-react";
import { FooterIndicator } from "@bentley/ui-ninezone";
import { Orientation, Select } from "@bentley/ui-core";
import { Id64String } from "@bentley/bentleyjs-core";
import { IModelContentTree } from "../../../components/IModelContentTree";
import { RobotWorldApp } from "./RobotWorldApp";

export class ViewsFrontstage extends FrontstageProvider {
  public static MAIN_VIEW_LAYOUT_ID = "MainView";
  public static MAIN_VIEW_XSECTION_SPLIT_LAYOUT_ID =
    "MainViewWithXSection.HorizontalSplit";
  public static MAIN_VIEW_PROFILE_SPLIT_LAYOUT_ID =
    "MainViewWithProfileSection.HorizontalSplit";
  public static MAIN_CONTENT_ID = "Main";
  public static XSECTION_CONTENT_ID = "XSection";
  public static PROFILE_CONTENT_ID = "ProfileSection";
  private _contentGroup: ContentGroup;
  private _mainViewWithProfileSectionLayout: ContentLayoutDef;
  public constructor(public viewStates: ViewState[]) {
    super();

    // this._mainViewWithProfileSectionLayout = new ContentLayoutDef({
    //   descriptionKey:
    //     "ProjectWiseReview:ContentLayoutDef.MainViewWithProfileSection",
    //   priority: 50,
    //   horizontalSplit: {
    //     id: ViewsFrontstage.MAIN_VIEW_PROFILE_SPLIT_LAYOUT_ID,
    //     percentage: 0.6,
    //     top: 0,
    //     bottom: 2,
    //   },
    // });
    this._mainViewWithProfileSectionLayout = new ContentLayoutDef({});

    const contentProps: ContentProps[] = [];

    contentProps.push({
      // id: ViewsFrontstage.MAIN_CONTENT_ID,
      // classId: IModelViewportControl,
      // applicationData: {
      //   viewState: this.viewStates[0],
      //   iModelConnection: UiFramework.getIModelConnection(),
      //   disableDefaultViewOverlay: true,
      // },ScheduleAnimationViewportControl
      classId: IModelViewportControl,
      applicationData: {
        getViewState: this.viewStates[0],
        iModelConnection: UiFramework.getIModelConnection(),
      },
    });
    this._contentGroup = new ContentGroup({ contents: [...contentProps] });
  }
  public static getTopCenterWidgets() {
    return [<Widget defaultState={WidgetState.Open} isToolSettings={true} />];
  }

  public static getTopRightWidgets() {
    // if (NavigatorApp.flags.useSharedNavigationWidget) {
    //   return [<Widget isFreeform={true} element={<BasicNavigationWidget />} />];
    // }
    // return [
    //   <Widget isFreeform={true} element={<NavigatorNavigationWidget />} />,
    // ];
    return [<Widget isFreeform={true} element={<BasicNavigationWidget />} />];
  }
  public get frontstage() {
    return (
      <Frontstage
        id={"ViewsFrontstage"}
        defaultTool={NavigatorTools.selectElementCommand}
        defaultLayout={this._mainViewWithProfileSectionLayout}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        topCenter={<Zone widgets={ViewsFrontstage.getTopCenterWidgets()} />}
        // topRight={<Zone widgets={ViewsFrontstage.getTopRightWidgets()} />}
        topLeft={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<SampleToolWidget />} />,
            ]}
          />
        }
        viewNavigationTools={
          <Zone
            widgets={[
              <Widget
                isFreeform={true}
                element={
                  <DefaultNavigationWidget
                    suffixVerticalItems={TestFeature.ItemLists}
                  />
                }
              />,
            ]}
          />
        }
        // viewNavigationTools={
        //   <Zone
        //     widgets={[
        //       /** Use standard NavigationWidget delivered in ui-framework */
        //       <Widget
        //         isFreeform={true}
        //         element={
        //           <BasicNavigationWidget
        //             additionalVerticalItems={
        //               this._additionalNavigationVerticalToolbarItems
        //             }
        //           />
        //         }
        //       />,
        //     ]}
        //   />
        // }
        statusBar={
          <Zone
            widgets={[
              <Widget
                isStatusBar={true}
                control={SmallStatusBarWidgetControl1}
              />,
            ]}
          />
        }
        // centerRight={
        //   <Zone
        //     defaultState={ZoneState.Minimized}
        //     allowsMerging={true}
        //     mergeWithZone={ZoneLocation.CenterRight}
        //     initialWidth={450}
        //     widgets={[
        //       <Widget
        //         id="VerticalPropertyGrid"
        //         defaultState={WidgetState.Hidden}
        //         iconSpec="icon-placeholder"
        //         labelKey="SampleApp:widgets.VerticalPropertyGrid"
        //         control={VerticalPropertyGridWidgetControl}
        //       />,
        //     ]}
        //   />
        // }
        centerLeft={
          <Zone
            widgets={[
              /** Use standard NavigationWidget delivered in ui-framework */
              <Widget
                isFreeform={true}
                element={
                  <IModelConnectedNavigationWidget
                    suffixVerticalItems={
                      new ItemList([this._viewSelectorItemDef])
                    }
                  />
                }
              />,
            ]}
          />
        }
        centerRight={
          <Zone
            defaultState={ZoneState.Minimized}
            allowsMerging={true}
            widgets={[
              <Widget
                control={SunWidget}
                fillZone={true}
                iconSpec="icon-tree"
                labelKey="NineZoneSample:components.tree"
                applicationData={{
                  iModelConnection: UiFramework.getIModelConnection(),
                  viewState: this.viewStates[0],
                }}
              />,
            ]}
          />
        }
      ></Frontstage>
    );
  }

  /** Get the CustomItemDef for ViewSelector  */
  private get _viewSelectorItemDef() {
    return new CustomItemDef({
      customId: "sampleApp:viewSelector",
      reactElement: (
        <IModelConnectedViewSelector
          listenForShowUpdates={false} // Demo for showing only the same type of view in ViewSelector - See IModelViewport.tsx, onActivated
        />
      ),
    });
  }
}

export class LoadingStage extends FrontstageProvider {
  public get frontstage(): React.ReactElement<FrontstageProps> {
    const contentGroup: ContentGroup = new ContentGroup({
      contents: [
        {
          classId: "WaitSpinner",
        },
      ],
    });

    return (
      <Frontstage
        id={"LoadingStage"}
        defaultTool={NavigatorTools.selectElementCommand}
        contentGroup={contentGroup}
        defaultLayout="SingleContent"
        isInFooterMode={false}
      />
    );
  }
}

export class SampleToolWidget extends React.Component {
  public render(): React.ReactNode {
    const horizontalItems = new ItemList([
      CoreTools.selectElementCommand,
      CoreTools.fitViewCommand,
    ]);

    return (
      <ToolWidget
        appButton={AppUi.backstageToggleCommand}
        horizontalItems={horizontalItems}
      />
    );
  }
}
const NavigatorViewport = viewWithUnifiedSelection(ViewportComponent);
export class MyIModelViewportControl extends ViewportContentControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.getViewState) {
      this.reactElement = (
        <NavigatorViewport
          viewState={options.getViewState}
          imodel={options.iModelConnection}
          viewportRef={(v: ScreenViewport) => {
            this.viewport = v;

            // for convenience, if window defined bind viewport to window
            if (undefined !== window) (window as any).viewport = v;
          }}
        />
      ); // tslint:disable-line
    } else {
      this.reactElement = <div>hello,world</div>;
    }
  }
}
// ContentView Id's
export enum ContentViewId {
  IModelViewport = "Navigator.ContentView.IModelViewport",
}

ConfigurableUiManager.registerControl(
  ContentViewId.IModelViewport,
  MyIModelViewportControl
);
interface VisibilityTreeComponentProps {
  imodel: IModelConnection;
  activeView?: Viewport;
  enablePreloading?: boolean;
  accessToken?: AccessToken;
  config?: {
    modelsTree: {
      selectionMode?: SelectionMode;
      selectionPredicate?: ModelsTreeSelectionPredicate;
    };
    categoriesTree: {
      allViewports?: boolean;
    };
    spatialTree: {
      allViewports?: boolean;
    };
    storyTree: {
      allViewports?: boolean;
    };
  };
}
function VisibilityTreeComponent(props: VisibilityTreeComponentProps) {
  const { imodel, activeView, enablePreloading } = props;
  const spatialTreeProps = props.config?.spatialTree;

  return (
    <div className="ui-test-app-visibility-widget">
      <SelectableContent defaultSelectedContentId="models-tree">
        {[
          {
            id: "spatial-containment-tree",
            label: IModelApp.i18n.translate(
              "UiFramework:visibilityWidget.containment"
            ),
            render: React.useCallback(
              () => (
                <SpatialContainmentTree
                  iModel={imodel}
                  enablePreloading={enablePreloading}
                  {...spatialTreeProps}
                />
              ),
              [imodel, activeView, enablePreloading, spatialTreeProps]
            ),
          },
        ]}
      </SelectableContent>
    </div>
  );
}

export class VisibilityWidgetControl extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);
    this.reactNode = (
      <VisibilityTreeComponent
        imodel={options.iModelConnection}
        activeView={IModelApp.viewManager.selectedView}
        enablePreloading={options.enablePreloading}
        config={options.config}
      />
    );
  }
}

interface DisplayStyleFieldState {
  viewport?: ScreenViewport;
  displayStyles: Map<Id64String, DisplayStyleState>;
  styleEntries: { [key: string]: string };
}

/**
 * Shadow Field React component. This component is designed to be specified in a status bar definition.
 * It is used to enable/disable display of shadows.
 */
export class DisplayStyleField extends React.Component<
  StatusFieldProps,
  DisplayStyleFieldState
> {
  constructor(props: StatusFieldProps) {
    super(props);

    this.state = {
      viewport: undefined,
      displayStyles: new Map<Id64String, DisplayStyleState>(),
      styleEntries: {},
    };
  }

  private async setStateFromActiveContent(
    contentControl?: ContentControl
  ): Promise<void> {
    if (contentControl && contentControl.viewport) {
      const unnamedPrefix = IModelApp.i18n.translate(
        "SampleApp:statusFields.unnamedDisplayStyle"
      );
      const displayStyles = new Map<Id64String, DisplayStyleState>();
      const view = contentControl.viewport.view;
      const is3d = view.is3d();
      const sqlName: string = is3d
        ? DisplayStyle3dState.classFullName
        : DisplayStyle2dState.classFullName;
      const displayStyleProps = await view.iModel.elements.queryProps({
        from: sqlName,
        where: "IsPrivate=FALSE",
      });
      const styleEntries: { [key: string]: string } = {};
      let emptyNameSuffix = 0;
      for (const displayStyleProp of displayStyleProps) {
        let name = displayStyleProp.code.value!;
        if (0 === name.length) {
          emptyNameSuffix++;
          name = `${unnamedPrefix}-${emptyNameSuffix}`;
        }
        styleEntries[displayStyleProp.id!] = name;

        let displayStyle: DisplayStyleState;
        if (is3d)
          displayStyle = new DisplayStyle3dState(displayStyleProp, view.iModel);
        else
          displayStyle = new DisplayStyle2dState(displayStyleProp, view.iModel);

        displayStyles.set(displayStyleProp.id!, displayStyle);
      }

      this.setState((_prevState) => ({
        viewport: contentControl.viewport,
        displayStyles,
        styleEntries,
      }));
    }
  }

  private _handleContentControlActivatedEvent = (
    args: ContentControlActivatedEventArgs
  ) => {
    setImmediate(() =>
      this.setStateFromActiveContent(args.activeContentControl)
    );
  };

  public componentDidMount() {
    FrontstageManager.onContentControlActivatedEvent.addListener(
      this._handleContentControlActivatedEvent
    );

    // tslint:disable-next-line: no-floating-promises
    this.setStateFromActiveContent(
      ContentViewManager.getActiveContentControl()
    );
  }

  public componentWillUnmount() {
    FrontstageManager.onContentControlActivatedEvent.removeListener(
      this._handleContentControlActivatedEvent
    );
  }

  private _handleDisplayStyleSelected = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    if (!this.state.viewport) return;

    this.state.viewport!.displayStyle = this.state.displayStyles
      .get(event.target.value)!
      .clone();
    this.state.viewport!.invalidateScene();
    this.state.viewport!.synchWithView();
    this.forceUpdate();
  };

  public render(): React.ReactNode {
    if (!this.state.viewport) return null;

    const displayStyleId = this.state.viewport.view.displayStyle.id;

    return (
      <FooterIndicator
        style={this.props.style}
        isInFooterMode={this.props.isInFooterMode}
      >
        <Select
          options={this.state.styleEntries}
          value={displayStyleId}
          onChange={this._handleDisplayStyleSelected}
          title={IModelApp.i18n.translate(
            "SampleApp:statusFields.displayStyle"
          )}
          className="uifw-statusFields-displayStyle-selector"
        />
      </FooterIndicator>
    );
  }
}

export class SmallStatusBarWidgetControl1 extends StatusBarWidgetControl {
  private _statusBarItems: StatusBarItem[] | undefined;

  private get statusBarItems(): StatusBarItem[] {
    // tslint:disable-next-line: variable-name
    const ViewAttributes = withStatusFieldProps(ViewAttributesStatusField);
    // tslint:disable-next-line: variable-name
    const SelectionInfo = withStatusFieldProps(SelectionInfoField);
    // tslint:disable-next-line: variable-name
    const SelectionScope = withStatusFieldProps(SelectionScopeField);
    // tslint:disable-next-line: variable-name
    const TileLoadIndicator = withStatusFieldProps(TileLoadingIndicator);
    if (!this._statusBarItems) {
      // const isHiddenCondition = new ConditionalBooleanValue(
      //   () => SampleAppIModelApp.getTestProperty() === "HIDE",
      //   [SampleAppUiActionId.setTestProperty]
      // );

      this._statusBarItems = [
        // StatusBarItemUtilities.createStatusBarItem(
        //   "ToolAssistance",
        //   StatusBarSection.Left,
        //   10,
        //   <ToolAssistance style={{ minWidth: "21em" }} />
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "ToolAssistanceSeparator",
        //   StatusBarSection.Left,
        //   15,
        //   <FooterMode>
        //     {" "}
        //     <FooterSeparator />{" "}
        //   </FooterMode>
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "MessageCenter",
        //   StatusBarSection.Left,
        //   20,
        //   <MessageCenter />
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "MessageCenterSeparator",
        //   StatusBarSection.Left,
        //   25,
        //   <FooterMode>
        //     {" "}
        //     <FooterSeparator />{" "}
        //   </FooterMode>
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "DisplayStyle",
        //   StatusBarSection.Center,
        //   40,
        //   <DisplayStyle />
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "ActivityCenter",
        //   StatusBarSection.Center,
        //   10,
        //   <ActivityCenter />
        // ),
        StatusBarItemUtilities.createStatusBarItem(
          "ViewAttributes",
          StatusBarSection.Center,
          60,
          <ViewAttributes />
        ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "Sections",
        //   StatusBarSection.Center,
        //   50,
        //   <Sections hideWhenUnused={true} />
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "ClearEmphasis",
        //   StatusBarSection.Center,
        //   40,
        //   <ClearEmphasis hideWhenUnused={true} />
        // ),
        // StatusBarItemUtilities.createStatusBarItem(
        //   "SnapMode",
        //   StatusBarSection.Center,
        //   30,
        //   <SnapMode />,
        //   { isHidden: false }
        // ),
        StatusBarItemUtilities.createStatusBarItem(
          "TileLoadIndicator",
          StatusBarSection.Right,
          10,
          <TileLoadIndicator />
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "SelectionInfo",
          StatusBarSection.Right,
          30,
          <SelectionInfo />
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "SelectionScope",
          StatusBarSection.Right,
          20,
          <SelectionScope />
        ),
      ];
    }
    return this._statusBarItems;
  }

  public getReactNode(_args: StatusBarWidgetControlArgs): React.ReactNode {
    return <StatusBarComposer items={this.statusBarItems} />;
  }
}

ConfigurableUiManager.registerControl(
  "SmallStatusBar1",
  SmallStatusBarWidgetControl1
);

interface MyProp {
  currentSelectNum: number;
}

interface MyComponentProps {
  iModel: IModelConnection;
}
function MyComponent(props: MyComponentProps) {
  return <IModelContentTree iModel={props.iModel} />;
}

class SunWidget extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = (
        <ViewSelector
          imodel={options.iModelConnection}
          listenForShowUpdates={false}
        />
      );
    } else {
      this.reactNode = <div>明月几时有</div>;
    }
  }
}
class YueLiang extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = (
        <IModelConnectedViewSelector
          listenForShowUpdates={false} // Demo for showing only the same type of view in ViewSelector - See IModelViewport.tsx, onActivated
        />
      );
    } else {
      this.reactNode = <div>明月几时有</div>;
    }
  }
}
class SamplePropertyRecord extends PropertyRecord {
  constructor(
    name: string,
    index: number,
    value: any,
    typename: string = StandardTypeNames.String,
    editor?: string
  ) {
    const v = {
      valueFormat: PropertyValueFormat.Primitive,
      value,
      displayValue: value.toString(),
    } as PrimitiveValue;
    const p = {
      name: name + index,
      displayLabel: name,
      typename,
    } as PropertyDescription;
    if (editor) p.editor = { name: editor, params: [] };
    super(v, p);

    this.description = `${name} - description`;
    this.isReadonly = false;
  }
}
class SamplePropertyDataProvider extends SimplePropertyDataProvider {
  constructor() {
    super();

    this.addCategory({ name: "Group_1", label: "第一组", expand: false });
    this.addCategory({
      name: "Group_2",
      label: "第二组",
      expand: false,
    });
    this.addCategory({ name: "Geometry", label: "第三组", expand: true });

    const categoryCount = this.categories.length;

    for (let i = 0; i < categoryCount; i++) {
      for (let iVolume = 0; iVolume < 10; iVolume++) {
        const enumPropertyRecord = new SamplePropertyRecord(
          "Enum",
          iVolume,
          0,
          StandardTypeNames.Enum
        );
        enumPropertyRecord.property.enum = { choices: [], isStrict: false };
        enumPropertyRecord.property.enum.choices = [
          { label: "Yellow", value: 0 },
          { label: "Red", value: 1 },
          { label: "Green", value: 2 },
          { label: "Blue", value: 3 },
        ];

        const booleanPropertyRecord = new SamplePropertyRecord(
          "Boolean",
          iVolume,
          true,
          StandardTypeNames.Boolean,
          iVolume % 2 ? StandardEditorNames.Toggle : undefined
        );
        // booleanPropertyRecord.editorLabel = "Optional CheckBox Label";

        const propData = [
          [
            new SamplePropertyRecord("CADID", iVolume, "0000 0005 00E0 02D8"),
            new SamplePropertyRecord(
              "ID_Attribute",
              iVolume,
              "34B72774-E885-4FB7-B031-64D040E37322"
            ),
            new SamplePropertyRecord("Name", iVolume, "DT1002"),
            enumPropertyRecord,
            booleanPropertyRecord,
          ],
          [
            new SamplePropertyRecord(
              "ID",
              iVolume,
              "34B72774-E885-4FB7-B031-64D040E37322",
              ""
            ),
            new SamplePropertyRecord("Model", iVolume, "Default"),
            new SamplePropertyRecord("Level", iVolume, "Default"),
          ],
          [
            new SamplePropertyRecord("Area", iVolume, "6.1875", "ft2"),
            new SamplePropertyRecord("Height", iVolume, "1.375", "ft"),
            new SamplePropertyRecord("Width", iVolume, "4.5", "ft"),
            new SamplePropertyRecord(
              "Integer",
              iVolume,
              "5",
              "",
              StandardTypeNames.Int
            ),
            new SamplePropertyRecord(
              "Float",
              iVolume,
              "7.0",
              "",
              StandardTypeNames.Float
            ),
          ],
        ];

        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < propData[i].length; j++) {
          this.addProperty(propData[i][j], i);
        }
      }
    }
  }
}
export class VerticalPropertyGridWidgetControl extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    super.reactNode = <VerticalPropertyGridWidget />;
  }
}

class VerticalPropertyGridWidget extends React.Component {
  private _dataProvider: SamplePropertyDataProvider;

  constructor(props: any) {
    super(props);

    this._dataProvider = new SamplePropertyDataProvider();
  }

  private _updatePropertyRecord(
    record: PropertyRecord,
    newValue: PropertyValue
  ): PropertyRecord {
    return record.copyWithNewValue(newValue);
  }

  private _handlePropertyUpdated = async (
    args: PropertyUpdatedArgs,
    category: PropertyCategory
  ): Promise<boolean> => {
    let updated = false;

    if (args.propertyRecord) {
      const newRecord = this._updatePropertyRecord(
        args.propertyRecord,
        args.newValue
      );
      const catIdx = this._dataProvider.findCategoryIndex(category);
      if (catIdx >= 0)
        this._dataProvider.replaceProperty(
          args.propertyRecord,
          catIdx,
          newRecord
        );
      updated = true;
    }

    return updated;
  };

  public render() {
    return (
      <PropertyGrid
        dataProvider={this._dataProvider}
        orientation={Orientation.Vertical}
        isPropertySelectionEnabled={true}
        isPropertyEditingEnabled={true}
        onPropertyUpdated={this._handlePropertyUpdated}
      />
    );
  }
}
ConfigurableUiManager.registerControl(
  "VerticalPropertyGridDemoWidget",
  VerticalPropertyGridWidgetControl
);
