import {
  ContentControl,
  FrontstageProvider,
  ConfigurableUiManager,
  ConfigurableCreateInfo,
  ContentGroup,
  FrontstageProps,
  ContentLayoutDef,
  Frontstage,
  CoreTools,
  StatusBar,
} from "@bentley/ui-framework";
import React from "react";

class IModelIndexControl extends ContentControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);
    // this._setReactElement();
    this.reactElement = <div>hello,world</div>;
  }

  //   private _setReactElement() {
  //     super.reactNode = ()
  //   }

  //   /**
  //    * When activated, reload the react element since we may have different errors be loaded
  //    */
  //   public onActivated() {
  //     this._setReactElement();
  //   }
}

ConfigurableUiManager.registerControl("IModelIndexControl", IModelIndexControl);

export class IModelIndexStage extends FrontstageProvider {
  public get frontstage(): React.ReactElement<FrontstageProps> {
    const contentGroup: ContentGroup = new ContentGroup({
      contents: [
        {
          classId: "IModelIndexControl",
        },
      ],
    });

    // first find an appropriate layout
    // const contentLayoutProps:
    //   | ContentLayoutProps
    //   | undefined = NavigatorUI.findLayoutFromContentCount(
    //   contentGroup.contentPropsList.length
    // );
    const contentLayoutProps = new ContentLayoutDef({});
    if (!contentLayoutProps) return <div />;

    const contentLayoutDef: ContentLayoutDef = new ContentLayoutDef(
      contentLayoutProps
    );

    return (
      <Frontstage
        id={"FrontstageId.IModelIndexStage"}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={contentLayoutDef}
        contentGroup={contentGroup}
        statusBar={<StatusBar isInFooterMode={true} style={{ maxHeight: 0 }} />}
      />
    );
  }
}
