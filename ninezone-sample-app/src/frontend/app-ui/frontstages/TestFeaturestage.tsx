import {
  FrontstageProvider,
  ContentLayoutDef,
  ContentGroup,
  IModelViewportControl,
  UiFramework,
  Frontstage,
  CoreTools,
  Zone,
  ItemList,
  ToolWidget,
  BasicNavigationWidget,
  Widget,
} from "@bentley/ui-framework";
import { ViewState } from "@bentley/imodeljs-frontend";
import React from "react";
import { AppUi } from "../AppUi";

export class TestFeatureStage extends FrontstageProvider {
  private _contentLayout: ContentLayoutDef;
  private _contentGroup: ContentGroup;
  public constructor(public viewStates: ViewState[]) {
    super();
    this._contentLayout = new ContentLayoutDef({});
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: IModelViewportControl,
          applicationData: {
            ViewState: this.viewStates[0],
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
      ],
    });
  }
  public get frontstage() {
    return (
      <Frontstage
        id="TestFeatureState"
        defaultTool={CoreTools.selectElementCommand}
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
              <Widget isFreeform={true} element={<BasicNavigationWidget />} />,
            ]}
          />
        }
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
