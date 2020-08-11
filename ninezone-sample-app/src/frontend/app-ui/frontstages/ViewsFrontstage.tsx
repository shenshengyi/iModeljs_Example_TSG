import {
  FrontstageProvider,
  ContentGroup,
  IModelViewportControl,
  UiFramework,
  Frontstage,
  CoreTools,
  ContentLayoutDef,
  ContentProps,
  StagePanel,
  StagePanelState,
  Widget,
  WidgetState,
  FrameworkVersionSwitch,
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
  ModelsTree,
  ClassGroupingOption,
} from "@bentley/ui-framework";
import {
  IssuesResolutionWidget,
  IssuesResolutionWidget2,
} from "@bentley/issue-resolution";
import React from "react";
import {
  ViewState,
  IModelApp,
  ScreenViewport,
  TwoWayViewportSync,
} from "@bentley/imodeljs-frontend";
import { NavigatorTools } from "../tools/NavigatorTools";
import { ViewportComponent, SelectionMode } from "@bentley/ui-components";
import { TestFeature } from "./Features";
import { AppUi } from "../AppUi";
import { viewWithUnifiedSelection } from "@bentley/presentation-components";

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
  private _contentLayout: ContentLayoutDef;
  // Default layout
  private _mainViewLayout: ContentLayoutDef;
  private _mainViewWithXSectionLayout: ContentLayoutDef;
  private _mainViewWithProfileSectionLayout: ContentLayoutDef;
  public constructor(public viewStates: ViewState[]) {
    super();

    // Create the content layouts.
    this._mainViewLayout = new ContentLayoutDef({
      descriptionKey: "ProjectWiseReview:ContentLayoutDef.MainView",
      priority: 50,
      id: ViewsFrontstage.MAIN_VIEW_LAYOUT_ID,
    });

    this._mainViewWithXSectionLayout = new ContentLayoutDef({
      descriptionKey: "ProjectWiseReview:ContentLayoutDef.MainViewWithXSection",
      priority: 50,
      horizontalSplit: {
        id: ViewsFrontstage.MAIN_VIEW_XSECTION_SPLIT_LAYOUT_ID,
        percentage: 0.6,
        top: 0,
        bottom: 1,
      },
    });

    this._mainViewWithProfileSectionLayout = new ContentLayoutDef({
      descriptionKey:
        "ProjectWiseReview:ContentLayoutDef.MainViewWithProfileSection",
      priority: 50,
      horizontalSplit: {
        id: ViewsFrontstage.MAIN_VIEW_PROFILE_SPLIT_LAYOUT_ID,
        percentage: 0.6,
        top: 0,
        bottom: 2,
      },
    });

    this._contentLayout = new ContentLayoutDef({});

    const contentProps: ContentProps[] = [];

    contentProps.push({
      // id: ViewsFrontstage.MAIN_CONTENT_ID,
      // classId: IModelViewportControl,
      // applicationData: {
      //   viewState: this.viewStates[0],
      //   iModelConnection: UiFramework.getIModelConnection(),
      //   disableDefaultViewOverlay: true,
      // },
      classId: ContentViewId.IModelViewport,
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
              /** Use standard NavigationWidget delivered in ui-framework */
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
        // rightPanel={
        //   <StagePanel
        //     size={375}
        //     defaultState={StagePanelState.Minimized}
        //     widgets={[
        //       <Widget
        //         id="IssueResolution"
        //         label={"NavigatorApp:widgetTabs.IssueResolution"}
        //         defaultState={WidgetState.Closed}
        //         applicationData={{
        //           iModelConnection: UiFramework.getIModelConnection(),
        //           initialIssueId: "NavigatorApp.issueId",
        //         }}
        //       />,
        //     ]}
        //   />
        // }
      ></Frontstage>
    );
  }
}
// viewportRef?: (v: ScreenViewport) => void;
const sync = new TwoWayViewportSync();
function TwoViewportSync(v: ScreenViewport) {
  sync.connect(v, IModelApp.viewManager.selectedView!);
}
class SunWidget extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = (
        <ModelsTree
          iModel={options.iModelConnection}
          selectionMode={SelectionMode.Single}
          activeView={IModelApp.viewManager.selectedView}
          enableElementsClassGrouping={ClassGroupingOption.No}
        />
      );
    } else {
      this.reactNode = <div>明月几时有</div>;
    }
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

class SampleToolWidget extends React.Component {
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
