import { CoreTools, UiFramework } from "@bentley/ui-framework";
import { Tool } from "@bentley/imodeljs-frontend";
export enum ToolId {
  BackstageShow = "NavigatorApp.BackstageShow",
  BackstageHide = "NavigatorApp.BackstageHide",
  BackstageToggle = "NavigatorApp.BackstageToggle",
}

export class BackstageToggle extends Tool {
  public static toolId = ToolId.BackstageToggle;

  public run(): boolean {
    UiFramework.backstageManager.toggle();
    return true;
  }
}

export class NavigatorTools {
  public static get selectElementCommand() {
    return CoreTools.selectElementCommand;
  }
}
