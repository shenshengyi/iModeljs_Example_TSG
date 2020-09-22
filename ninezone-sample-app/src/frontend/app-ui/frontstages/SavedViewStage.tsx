import {
  Frontstage,
  Widget,
  ContentLayoutDef,
  ContentGroup,
  FrontstageProvider,
  CoreTools,
  Zone,
  NavigationWidget,
  ViewportContentControl,
  ConfigurableCreateInfo,
  FrontstageProps,
  ConfigurableUiManager,
  IModelViewportControl,
  UiFramework,
  FrontstageManager,
  ContentLayoutManager,
  SavedViewLayout,
  ContentProps,
  SavedViewLayoutProps,
} from "@bentley/ui-framework";
import React from "react";
import * as moq from "typemoq";
import { SampleToolWidget } from "./ViewsFrontstage";
import {
  ScreenViewport,
  ViewState,
  EmphasizeElements,
} from "@bentley/imodeljs-frontend";

export class SavedViewFrontstage1 extends FrontstageProvider {
  // Content group for both layouts
  private _contentGroup: ContentGroup;
  constructor(public viewStates: ViewState[]) {
    super();

    // Create the content group.
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: IModelViewportControl,
          applicationData: {
            viewState: this.viewStates[0],
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
      ],
    });
  }
  public contentLayoutDef: ContentLayoutDef = new ContentLayoutDef({
    id: "SingleContent",
    descriptionKey: "App:ContentLayoutDef.SingleContent",
    priority: 100,
  });

  public get frontstage(): React.ReactElement<FrontstageProps> {
    // const myContentGroup: ContentGroup = new ContentGroup({
    //   id: "MyContentGroup",
    //   contents: [
    //     {
    //       id: "TestViewport",
    //       classId: TestViewportContentControl,
    //       applicationData: { label: "Content 1a", bgColor: "black" },
    //     },
    //   ],
    // });

    return (
      <Frontstage
        id="SavedViewFrontstage1"
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={this.contentLayoutDef}
        //   contentGroup={myContentGroup}
        contentGroup={this._contentGroup}
        topLeft={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<SampleToolWidget />} />,
            ]}
          />
        }
        topRight={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<NavigationWidget />} />,
            ]}
          />
        }
      />
    );
  }
}

class TestViewportContentControl extends ViewportContentControl {
  static viewportMock = moq.Mock.ofType<ScreenViewport>();
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    this.reactNode = <div />;

    this.viewport = TestViewportContentControl.viewportMock.object;
  }
}
ConfigurableUiManager.registerControl(
  "TestViewport",
  TestViewportContentControl
);

export async function TestSavedView2020() {
  const frontstageProvider = FrontstageManager.findFrontstageDef(
    "SavedViewFrontstage1"
  );

  if (frontstageProvider) {
    await FrontstageManager.setActiveFrontstageDef(frontstageProvider);
    if (
      ContentLayoutManager.activeLayout &&
      ContentLayoutManager.activeContentGroup
    ) {
      const emphasizeElements = new EmphasizeElements();
      const getEmphasizeElements = EmphasizeElements.get;
      EmphasizeElements.get = () => emphasizeElements;
      const savedViewLayoutProps = SavedViewLayout.viewLayoutToProps(
        ContentLayoutManager.activeLayout,
        ContentLayoutManager.activeContentGroup,
        true,
        (contentProps: ContentProps) => {
          if (contentProps.applicationData) delete contentProps.applicationData;
        }
      );
      console.log(savedViewLayoutProps);
      return savedViewLayoutProps;
    }
  }
  return undefined;
}

export async function TestSavedViewNi2020(prop: SavedViewLayoutProps) {
  const imodel = UiFramework.getIModelConnection()!;
  const viewStates = await SavedViewLayout.viewStatesFromProps(imodel, prop);
  if (viewStates.length > 0) {
    return viewStates[0];
  }
  return undefined;
}
