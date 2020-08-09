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
import { ViewportComponent } from "@bentley/ui-components";
import { TestFeature } from "./Features";
import { AppUi } from "../AppUi";

export class ViewsFrontstage extends FrontstageProvider {
  private _contentGroup: ContentGroup;
  private _contentLayout: ContentLayoutDef;
  public constructor(public viewStates: ViewState[]) {
    super();
    this._contentLayout = new ContentLayoutDef({});

    const contentProps: ContentProps[] = [];

    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: IModelViewportControl,
          applicationData: {
            ViewState: this.viewStates[0],
            iModelConnection: UiFramework.getIModelConnection(),
            disableDefaultViewOverlay: true,
          },
        },
      ],
    });
  }
  public get frontstage() {
    return (
      <Frontstage
        id={"ViewsFrontstage"}
        defaultTool={NavigatorTools.selectElementCommand}
        defaultLayout={this._contentLayout}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
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
        rightPanel={
          <StagePanel
            size={375}
            defaultState={StagePanelState.Minimized}
            widgets={[
              <Widget
                id="IssueResolution"
                label={"NavigatorApp:widgetTabs.IssueResolution"}
                defaultState={WidgetState.Closed}
                applicationData={{
                  iModelConnection: UiFramework.getIModelConnection(),
                  initialIssueId: "NavigatorApp.issueId",
                }}
              />,
            ]}
          />
        }
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
        <ViewportComponent
          imodel={options.iModelConnection}
          viewState={options.viewState}
          viewportRef={TwoViewportSync}
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
    const horizontalItems = new ItemList([CoreTools.selectElementCommand]);

    return (
      <ToolWidget
        appButton={AppUi.backstageToggleCommand}
        horizontalItems={horizontalItems}
      />
    );
  }
}
