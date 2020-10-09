import {
  EventHandled,
  PrimitiveTool,
  BeButtonEvent,
  IModelApp,
  LocateResponse,
} from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";

export class MyTool extends PrimitiveTool {
  public static toolId = "MyTool";
  public readonly points: Point3d[] = [];

  public requireWriteableTarget(): boolean {
    return false;
  }
  public onPostInstall() {
    super.onPostInstall();
    this.setupAndPromptForNextAction();
  }

  public setupAndPromptForNextAction(): void {
    IModelApp.notifications.outputPromptByKey(
      "SampleApp:tools.Tool1.Prompts.GetPoint"
    );
  }

  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    await IModelApp.locateManager.doLocate(
      new LocateResponse(),
      true,
      ev.point,
      ev.viewport,
      ev.inputSource
    );
    const hit = IModelApp.locateManager.currHit;
    if (hit !== undefined) {
      // const str = await IModelApp.toolAdmin.getToolTip(hit);
      // const h: HTMLElement = str as HTMLElement;
      // const str = await IModelApp.viewManager.getElementToolTip(hit);
      // const h: HTMLElement = str as HTMLElement;
      // document.body.append(h);
      // alert(hit.sourceId);
      const vp = IModelApp.viewManager.selectedView!;
      vp.zoomToElements(hit.sourceId);
    }

    this.points.push(ev.point.clone());
    this.setupAndPromptForNextAction();
    return EventHandled.No;
  }

  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    alert("鼠标右键");
    IModelApp.toolAdmin.startDefaultTool();
    return EventHandled.No;
  }

  public onRestartTool(): void {
    const tool = new MyTool();
    if (!tool.run()) this.exitTool();
  }
}
