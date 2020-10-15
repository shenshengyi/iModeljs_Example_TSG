import {
  IModelApp,
  EmphasizeElements,
  Viewport,
  ViewChangeOptions,
  ZoomToOptions,
  PrimitiveTool,
  BeButtonEvent,
  EventHandled,
  ViewClipClearTool,
  ViewClipDecorationProvider,
  ScreenViewport,
  IModelConnection,
  DisplayStyle3dState,
  Tool,
  Environment,
  Decorator,
  DecorateContext,
  GraphicType,
  HitDetail,
  LocateFilterStatus,
  LocateResponse,
  BeWheelEvent,
  imageBufferToBase64EncodedPng,
  canvasToImageBuffer,
  ElementEditor3d,
  ViewState3d,
  OrthographicViewState,
  SpatialViewState,
  StandardViewId,
  AuthorizedFrontendRequestContext,
  ToolTipProvider,
  SelectionSetEvent,
  SelectionSetEventType,
} from "@bentley/imodeljs-frontend";
import {
  ItemList,
  CommandItemDef,
  UiFramework,
  SavedView,
  SavedViewProps,
} from "@bentley/ui-framework";
import {
  ColorDef,
  ViewStateProps,
  Code,
  ImageBuffer,
  GeometryStreamBuilder,
  GeometryStreamProps,
  GeometryParams,
  GeometricElement3dProps,
  CodeProps,
  ViewDefinition3dProps,
  Camera,
  ModelProps,
} from "@bentley/imodeljs-common";
import {
  Id64String,
  BeDuration,
  Id64Array,
  assert,
  Guid,
} from "@bentley/bentleyjs-core";
import {
  ClipVector,
  Point3d,
  ClipShape,
  ClipMaskXYZRangePlanes,
  Range3d,
  Box,
  Vector3d,
  YawPitchRollAngles,
  Arc3d,
} from "@bentley/geometry-core";
import { Briefcase } from "@bentley/imodelhub-client";
import { ToggleShadowMapTilesTool } from "./Zhuangshi";
import { ViewCreator3d } from "./ViewCreater3d";
import { BlankConnectionExample } from "./BlankConnectionExample";
import { RobotWorldApp } from "./RobotWorldApp";
import { SettingsStatus } from "@bentley/product-settings-client";
import { MyTool } from "./MyTool";
export class TestFeature {
  public static CreateCommand(
    id: string,
    des: string,
    func: (args?: any) => any
  ): CommandItemDef {
    const testV1Def = new CommandItemDef({
      commandId: id,
      execute: func,
      iconSpec: "icon-developer",
      label: des,
      description: des,
      tooltip: des,
    });
    return testV1Def;
  }
  public static ItemLists = new ItemList([
    TestFeature.CreateCommand("testGroud", "测试背景色", TestBackoundColor),
    TestFeature.CreateCommand("testGrid", "测试网格", TestGrid),
    TestFeature.CreateCommand("TestShadows", "测试阴影", TestShadows),
    TestFeature.CreateCommand(
      "TestSelectElement",
      "测试元素",
      TestSelectElement
    ),
    TestFeature.CreateCommand("TestEmphasize", "测试强调", TestEmphasize),
    TestFeature.CreateCommand("TestHide", "测试隐藏", TestHide),
    TestFeature.CreateCommand(
      "TestregisterEmphasizeElement",
      "检测是否注册EmphasizeElement",
      TestregisterEmphasizeElement
    ),
    TestFeature.CreateCommand("TestZoom", "测试Zoom", TestZoom),
    TestFeature.CreateCommand("TestDecorator", "测试装饰", TestDecorator),
    TestFeature.CreateCommand("TestShadow", "测试太阳时间阴影", TestShadow),
    TestFeature.CreateCommand("TestClip", "测试裁剪", TestClip),
    TestFeature.CreateCommand("TestTool", "测试工具", TestTool),
    TestFeature.CreateCommand("TestView", "测试View", TestView),
    TestFeature.CreateCommand(
      "TestViewManager",
      "测试ViewManager",
      TestViewManager
    ),
    TestFeature.CreateCommand("TestUnDo", "测试撤销", TestUnDo),
    TestFeature.CreateCommand(
      "TestElementLocateManager",
      "测试ElementLocateManager",
      TestElementLocateManager
    ),
    TestFeature.CreateCommand(
      "TestDownloadViewport",
      "测试DownloadViewport",
      TestDownloadViewport
    ),
    TestFeature.CreateCommand(
      "testAllCategories",
      "测试Categories",
      testAllCategories
    ), //
    TestFeature.CreateCommand(
      "TestElementEdit",
      "测试元素编辑",
      TestElementEdit
    ),
    TestFeature.CreateCommand(
      "QueryCreateElement",
      "查询所创建Element",
      QueryCreateElement
    ),
    TestFeature.CreateCommand("TestBlankView", "测试空白View", TestBlankView), //TestSavedViewNi
    TestFeature.CreateCommand("TestSavedView", "测试SavedView", TestSavedView),
    TestFeature.CreateCommand(
      "TestSavedViewNi",
      "测试从SaveView获取viewState",
      TestSavedViewNi
    ),
    TestFeature.CreateCommand(
      "TestViewManagers",
      "测试序列化savedView.",
      TestSerializationView
    ),
    TestFeature.CreateCommand(
      "TestGetViewStateFromCloud",
      "测试反序列化View",
      TestDeserializationView
    ),
  ]);
}
//测试背景色;
let mark = 0;
async function TestBackoundColor() {
  let vp = IModelApp.viewManager.selectedView;
  const distyle = vp?.displayStyle;
  let style = distyle!.clone();
  if (mark % 2 == 0) {
    style.backgroundColor = ColorDef.red;
  } else {
    style.backgroundColor = ColorDef.white;
  }
  mark++;
  vp!.displayStyle = style;
}

//测试网格grid;
async function TestGrid() {
  let vp = IModelApp.viewManager.selectedView;
  const flag = vp!.viewFlags;
  let f = flag.clone();
  if (mark % 2 == 0) {
    f.grid = true;
  } else {
    f.grid = false;
  }
  mark++;
  vp!.viewFlags = f;
}
//测试阴影;
async function TestShadows() {
  let vp = IModelApp.viewManager.selectedView;
  const flag = vp!.viewFlags;
  let f = flag.clone();
  if (mark % 2 == 0) {
    f.shadows = true;
  } else {
    f.shadows = false;
  }
  mark++;
  vp!.viewFlags = f;
}
//选择元素;
async function TestSelectElement() {
  const imodel = UiFramework.getIModelConnection();
  const elementIdSet = imodel!.selectionSet;
  const au: string[] = [];
  for (const id of elementIdSet.elements.values()) {
    au.push(id);
  }
  // alert(
  //   "当前选中了" + au.length.toString() + "个元素" + "id =" + au[0].toString()
  // );
  // if (au.length != 0) {
  //   const propList = await imodel!.elements.getProps(au[0]);
  //   alert(propList[0].jsonProperties);
  // }
  const sql = "select * from bis.Element";
  const num = await imodel!.queryRowCount(sql);
  alert("查询个数=" + num.toString());
}
//测试Emphasize
async function TestEmphasize() {
  const vp = IModelApp.viewManager.selectedView;

  if (undefined === vp) {
    return;
  }
  const emph = EmphasizeElements.getOrCreate(vp);
  emph.wantEmphasis = true;
  emph.emphasizeSelectedElements(vp);
}
//测试隐藏
async function TestHide() {
  const vp = IModelApp.viewManager.selectedView;

  if (undefined === vp) {
    return;
  }
  const emph = EmphasizeElements.getOrCreate(vp);
  emph.hideSelectedElements(vp);
}
//检测是否注册EmphasizeElements
async function TestregisterEmphasizeElement() {
  // const vp = IModelApp.viewManager.selectedView;
  // vp?.addFeatureOverrideProvider(new MyProvider());
  // let provider = vp!.findFeatureOverrideProviderOfType<MyProvider>(MyProvider);
  // if (undefined == provider) {
  //   alert("没有注册EmphasizeElements");
  // } else {
  //   alert("已经注册EmphasizeElements");
  // }
}

async function TestZoom() {
  const vp = IModelApp.viewManager.selectedView!;
  //设置聚焦的元素集；
  const idArray: Id64String[] = ["0x40000000838"];
  //配置呈现方式；
  const prop: ViewChangeOptions & ZoomToOptions = {
    animateFrustumChange: true, //以动画形式呈现;
  };
  await vp.zoomToElements(idArray, prop);
}

class TestPolylineDecorator implements Decorator {
  public decorate(context: DecorateContext) {
    // draw semi-transparent polyline from top left to bottom right of vp
    const overlayBuilder = context.createGraphicBuilder(
      GraphicType.ViewOverlay
    );
    const polylineColor = ColorDef.from(0, 255, 0, 128);
    overlayBuilder.setSymbology(polylineColor, polylineColor, 10);
    const ps: Point3d[] = [
      new Point3d(100, 0, 0),
      new Point3d(100, 500, 0),
      new Point3d(500, 500, 0),
      new Point3d(100, 0, 0),
    ];
    overlayBuilder.addShape(ps);
    context.addDecorationFromBuilder(overlayBuilder);
  }
}
//创建decorate(装饰器);
let decorate = new TestPolylineDecorator();
// //将decorate(装饰器)添加到viewManager中的decorate集合中，并触发视图重绘;
// IModelApp.viewManager.addDecorator(decorate);
// //从viewManager中的decorate集合中删除指定的decorate,并触发视图重绘;
// IModelApp.viewManager.dropDecorator(decorate);

async function TestDecorator() {
  IModelApp.viewManager.addDecorator(decorate);
}

//测试太阳时间阴影
async function TestShadow() {
  const vp = IModelApp.viewManager.selectedView;

  if (vp && vp.view.is3d()) {
    const date = new Date();
    const time = date.getTime();
    const displayStyle = vp.view.getDisplayStyle3d();
    let style = displayStyle.clone(UiFramework.getIModelConnection()!);
    style.setSunTime(time);
    // alert("time = " + time.toString());
    vp.displayStyle = style;
    vp.synchWithView();
  }
}
//测试裁剪
async function TestClip() {
  const vp = IModelApp.viewManager.selectedView;
  IModelApp.tools.run(ViewClipClearTool.toolId);
  ViewClipDecorationProvider.create().toggleDecoration(vp!);
  if (!vp!.view.getViewClip()) addExtentsClipRange(vp!);
}
const addExtentsClipRange = (vp: ScreenViewport) => {
  const range = vp.view.computeFitRange();
  range.high.z = (range.high.z + range.low.z) / 2.0;
  const block: ClipShape = ClipShape.createBlock(
    range,
    range.isAlmostZeroZ
      ? ClipMaskXYZRangePlanes.XAndY
      : ClipMaskXYZRangePlanes.All,
    false,
    false
  );
  const clip: ClipVector = ClipVector.createEmpty();
  clip.appendReference(block);
  vp.view.setViewClip(clip);
  vp.setupFromView();
  const vcdp: ViewClipDecorationProvider = ViewClipDecorationProvider.create();
  vcdp.clearDecorationOnDeselect = false;
  vcdp.showDecoration(vp);
  IModelApp.toolAdmin.startDefaultTool();
};
abstract class DisplayStyleTool extends Tool {
  protected get require3d() {
    return false;
  }
  // Return true if the display style was modified - we will invalidate the viewport's render plan.
  protected abstract execute(vp: Viewport): boolean;
  // Return false if failed to parse.
  protected abstract parse(args: string[]): boolean;

  public run(): boolean {
    const vp = IModelApp.viewManager.selectedView;
    if (
      undefined !== vp &&
      (!this.require3d || vp.view.is3d()) &&
      this.execute(vp)
    )
      vp.displayStyle = vp.view.displayStyle;

    return true;
  }

  public parseAndRun(...args: string[]): boolean {
    const vp = IModelApp.viewManager.selectedView;
    if (
      undefined !== vp &&
      (!this.require3d || vp.view.is3d()) &&
      this.parse(args)
    )
      return this.run();
    else return false;
  }
}

export class ToggleSkyboxTool extends DisplayStyleTool {
  public static toolId = "ToggleSkybox";

  public get require3d() {
    return true;
  }

  public parse(_args: string[]) {
    return true;
  } // no arguments

  public execute(vp: Viewport): boolean {
    const style = vp.view.displayStyle as DisplayStyle3dState;
    style.environment = new Environment({
      sky: { display: !style.environment.sky.display },
    });
    return true;
  }
}
//测试工具
async function TestTool() {
  //IModelApp.tools.run(FitViewTool.toolId);//ToggleSkyboxTool
  //IModelApp.tools.run(ToggleSkyboxTool.toolId); //ToggleSkyboxTool
  IModelApp.tools.run(ToggleShadowMapTilesTool.toolId); //ToggleSkyboxTool
}
//测试view
async function TestView() {
  const imodel = UiFramework.getIModelConnection();
  const models = await imodel!.models.queryProps({
    from: "BisCore.GeometricModel3d",
  });
  const idList: string[] = [];
  for (const m of models) {
    idList.push(m.id!);
  }
  const vp = IModelApp.viewManager.selectedView;

  const v: SpatialViewState | undefined = vp!.view as SpatialViewState;
  const ids: string[] = [];

  const props = await CreateViewStateProps(ids, ColorDef.green, v);
  let viewState:
    | OrthographicViewState
    | undefined = OrthographicViewState.createFromProps(
    props,
    UiFramework.getIModelConnection()!
  );

  await viewState.load();
  imodel!.saveChanges();

  vp!.changeView(viewState);

  // const vs1 = await imodel!.views.getViewList({});
  // alert("view1个数=" + vs1.length.toString());
}
async function CreateViewStateProps(
  modelId: Id64String[],
  bgColor: ColorDef,
  v: SpatialViewState
): Promise<ViewStateProps> {
  console.log(bgColor);
  console.log(modelId.length);
  const imodel = UiFramework.getIModelConnection();
  const v3: ViewState3d = v as ViewState3d;
  const modelExtents = Range3d.fromJSON(imodel!.projectExtents!);

  const modelSelectorProps = {
    ...v.modelSelector.toJSON(),
    code: Code.createEmpty(),
  };

  const categorySelectorProps = {
    ...v.categorySelector.toJSON(),
    code: Code.createEmpty(),
  };

  const viewDefinitionProps: ViewDefinition3dProps = {
    ...v3.toJSON(),
    code: Code.createEmpty(),
    camera: new Camera(),
  };
  let json = v.displayStyle.toJSON().jsonProperties;
  (json as any).styles.backgroundColor = bgColor.toJSON();
  const displayStyleProps = {
    ...v.displayStyle.toJSON(),
    ...json,
    code: Code.createEmpty(),
  };

  return {
    displayStyleProps,
    modelSelectorProps,
    categorySelectorProps,
    viewDefinitionProps,
    modelExtents,
  };
}
//测试撤销;
async function TestUnDo() {
  const vp = IModelApp.viewManager.selectedView;
  // if (vp!.isUndoPossible) {
  //   alert("可以撤销");
  // } else {
  //   alert("不可以撤销");
  // }
  vp!.doUndo();
}
//测试ViewManager
async function TestViewManager() {
  IModelApp.viewManager.dropDecorator(decorate);
  // const s = IModelApp.i18n.languageList();
  // alert(s);
  // alert(IModelApp.viewManager.)
  // const imodel = UiFramework.getIModelConnection();
  // const vp = IModelApp.viewManager.selectedView;
  // // alert(DisplayStyle2dState.classFullName);
  // // alert(DisplayStyle3dState.classFullName);
  // const sqlName = vp!.view.is3d()
  //   ? DisplayStyle3dState.classFullName
  //   : DisplayStyle2dState.classFullName;
  // const displays = await imodel!.elements.queryProps({ from: sqlName });
  // // alert("样式个数=" + displays.length.toString());
  // if (displays.length > 0) {
  //   const displayStyleProp = displays[0];
  //   let displayStyle = new DisplayStyle3dState(displayStyleProp, imodel!);
  //   // let vf = vp!.viewFlags;
  //   // vf.grid = true;
  //   // vf.shadows = true;
  //   // vp!.viewFlags = vf;
  //   const v: DisplayStyle3dSettingsProps = {};
  //   vp!.overrideDisplayStyle({
  //     backgroundColor: ColorDef.red.tbgr,
  //     viewflags: { grid: true, shadows: true, acs: true },
  //     environment: { sky: { skyColor: ColorDef.blue.tbgr } },
  //   } as DisplayStyle3dSettingsProps);
  //environment: { sky: {skyColor:ColorDef.blue.tbgr}} },
  // if (dy) {
  //   alert("转换成功");
  //   const my = dy.clone(imodel!);
  // } else {
  //   alert("转换失败");
  // }
  // let my = dy.clone(imodel!);
  // my.backgroundColor = ColorDef.red;

  // // vp!.backgroundMapSettings = myDisplay.jsonProperties.styles;
  // vp!.displayStyle = displayStyle;

  // vp!.invalidateScene();
  // alert(displays[0].id);
  // alert(displays[0].classFullName);
  // // // const x = JSON.stringify(displays[0].jsonProperties);
  // // console.log(displays[0].jsonProperties.styles);
  // // alert(displays[0].jsonProperties.styles);
  // // const x = JSON.stringify(displays[0].jsonProperties.styles);
  // const s = displays[0].jsonProperties.styles;
  // const x = s as DisplayStyle3dSettingsProps;
  // alert(x.environment?.sky?.groundExponent);
  // }
  // const ovr = SubCategoryOverride.fromJSON({
  //   color: ColorDef.red.tbgr,
  //   weight: 20,
  // });
  // // let style = vp!.displayStyle.clone();
  // // style.overrideSubCategory("0x123", ovr);
  // vp!.overrideDisplayStyle({
  //   viewflags: { grid: true, shadows: true, acs: true },
  // });
  // vp!.displayStyle = style;

  // // view!.changeModelDisplay();
  // const imodel = UiFramework.getIModelConnection();
  // const sql = "select * from bis.Model";
  // const modelId: string[] = [];
  // for await (const row of imodel!.query(sql)) {
  //   modelId.push(row.id);
  // }

  // if (vp!.view.isSpatialView()) {
  //   alert("是空间模型状态");
  // }
  // const ssTate = vp!.view as SpatialViewState;
  // if (ssTate == undefined) {
  //   alert("测试失败");
  //   return;
  // }
  // const idM: string[] = [];
  // for (const id of modelId) {
  //   if (ssTate.modelSelector.containsModel(id)) {
  //     idM.push(id);
  //   }
  // }

  // alert("model num =" + idM.length.toString());
  // vp!.changeModelDisplay(idM[0], false);

  // const modelProps = await imodel!.models.getProps(idM[0]);
  // if (modelProps.length > 0) {
  //   alert(modelProps[0].classFullName + " id =" + modelProps[0].id);
  // }
  // const id = "0x20000000001";
  // vp!.addViewedModels(id);
}
//测试ElementLocateManager
async function TestElementLocateManager() {
  // const curr = IModelApp.locateManager.currHit;
  // alert(IModelApp.applicationId);
  // if (curr) {
  //   alert("当前选中的模型名称为:" + curr.iModel.name);ToggleSkyboxTool
  // }
  const r = IModelApp.tools.run(Tool1.toolId);
  if (r) {
    alert("工具启动成功");
  } else {
    alert("工具启动失败");
  }
}
export class SampleLocateTool extends PrimitiveTool {
  public static toolId = "SampleLocate";
  // public static toolId = "ToggleSkybox";
  public onRestartTool(): void {
    this.exitTool();
  }

  // __PUBLISH_EXTRACT_START__ PrimitiveTool_Locate
  public async filterHit(
    hit: HitDetail,
    _out?: LocateResponse
  ): Promise<LocateFilterStatus> {
    // Check that element is valid for the tool operation, ex. query backend to test class, etc.
    // For this example we'll just test the element's selected status.
    const isSelected = this.iModel.selectionSet.has(hit.sourceId);
    return isSelected ? LocateFilterStatus.Reject : LocateFilterStatus.Accept; // Reject element that is already selected
  }

  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    const hit = await IModelApp.locateManager.doLocate(
      new LocateResponse(),
      true,
      ev.point,
      ev.viewport,
      ev.inputSource
    );
    if (hit !== undefined) this.iModel.selectionSet.replace(hit.sourceId); // Replace current selection set with accepted element
    alert("选中元素");
    return EventHandled.No;
  }

  public onPostInstall() {
    super.onPostInstall();
    this.initLocateElements(); // Enable AccuSnap locate, set view cursor, add CoordinateLockOverrides to disable unwanted pre-locate point adjustments...
  }
  // __PUBLISH_EXTRACT_END__
}
export class Tool1 extends PrimitiveTool {
  public static toolId = "Tool1";
  public readonly points: Point3d[] = [];

  public requireWriteableTarget(): boolean {
    return false;
  }
  public onPostInstall() {
    super.onPostInstall();
    this.setupAndPromptForNextAction();
  }
  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.No;
  }
  public setupAndPromptForNextAction(): void {
    IModelApp.notifications.outputPromptByKey(
      "SampleApp:tools.Tool1.Prompts.GetPoint"
    );
  }
  public async filterHit(
    _hit: HitDetail,
    _out?: LocateResponse
  ): Promise<LocateFilterStatus> {
    // alert("选中元素，拒绝");
    return LocateFilterStatus.Accept;
  }
  //
  async getToolTip(_hit: HitDetail): Promise<HTMLElement | string> {
    return "hello,NBA2020";

    // return super.getToolTip(_hit);
  }

  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    // this.points.push(ev.point.clone());
    // this.setupAndPromptForNextAction();
    // alert("points size = " + this.points.length.toString());
    // const hit = IModelApp.locateManager.currHit;
    await IModelApp.locateManager.doLocate(
      new LocateResponse(),
      true,
      ev.point,
      ev.viewport,
      ev.inputSource
    );
    const hit = IModelApp.locateManager.currHit;
    if (hit !== undefined) {
      const str = await IModelApp.toolAdmin.getToolTip(hit);

      // const str = await IModelApp.viewManager.getElementToolTip(hit);
      alert(str as string);
      // document.append(str);
      // document.body.appendChild(str as HTMLElement);
      // alert(str.toString());
      // const vp = IModelApp.viewManager.selectedView!;

      // this.showLocateMessage(ev.viewPoint, vp, str);
      // this.iModel.selectionSet.replace(hit.sourceId); // Replace current selection set with accepted element
      // const props = await this.iModel.elements.getProps(hit.sourceId);
      // if (props && props.length > 0) {
      //   alert("选中元素的种类:" + props[0].classFullName);
      // }
    } else {
      alert("没有选中元素");
    }

    return EventHandled.No;
  }
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    IModelApp.toolAdmin.startDefaultTool();
    return EventHandled.No;
  }

  public onRestartTool(): void {
    const tool = new Tool1();
    if (!tool.run()) this.exitTool();
  }
}

//测试downloadViewport
async function TestDownloadViewport() {
  // const vp = IModelApp.viewManager.selectedView;
  // const image = generateDecoratedViewportUrlData(vp!);
  // alert(image);
  // if (
  //   ParseAndRunResult.Success ==
  //   IModelApp.tools.parseAndRun("fdt project extents")
  // ) {
  //   alert("运行成功");
  // } else {
  //   alert("运行失败");
  // }
  const ideaDialog = document.createElement("div");
  ideaDialog.id = "dr-idea-dialog";
  ideaDialog.style.top = "50px";
  const link = document.createElement("a");
  const ideaDialogLI1 = document.createElement("li");
  const ideaDialogLI2 = document.createElement("li");
  const ideaDialogLI3 = document.createElement("li");
  const ideaDialogLI4 = document.createElement("li");
  ideaDialogLI1.appendChild(link);
  ideaDialog.appendChild(ideaDialogLI1);
  ideaDialog.appendChild(ideaDialogLI2);
  var btn = document.createElement("BUTTON");
  ideaDialogLI2.appendChild(btn);
  ideaDialog.appendChild(ideaDialogLI3);
  ideaDialog.appendChild(ideaDialogLI4);
  document.body.appendChild(ideaDialog);
}

export const generateDecoratedViewportUrlData = (
  vp: Viewport
): string | undefined => {
  const isUsingWebGL = (vp.target as any)._usingWebGLCanvas; // This is wrong and specific to OnScreenTarget, should this be a public prop ?
  if (isUsingWebGL) {
    // OnScreenTarget renders content and overlay in 2 different canvas that is not caught by readImage, but this is
    // specific to OnScreenTarget, should readImage have a parameter to include or not the overlays ?
    vp.target.setRenderToScreen(false);
  }

  renderFrameWithNoAccuSnap(vp);
  const imageBuffer = canvasToImageBuffer(vp.readImageToCanvas());
  const vanvas = vp.readImageToCanvas();
  const ss = vanvas.toDataURL("image/png");
  alert(ss);

  if (isUsingWebGL) {
    vp.target.setRenderToScreen(isUsingWebGL);
  }

  return encodeToUrlData(imageBuffer);
};
// let theViewport: ScreenViewport | undefined;
// async function savePng(
//   fileName: string,
//   canvas?: HTMLCanvasElement
// ): Promise<void> {
//   if (!canvas)
//     canvas =
//       theViewport !== undefined ? theViewport.readImageToCanvas() : undefined;
//   if (canvas !== undefined) {
//     const img = canvas.toDataURL("image/png"); // System.instance.canvas.toDataURL("image/png");
//     const data = img.replace(/^data:image\/\w+;base64,/, ""); // strip off the data: url prefix to get just the base64-encoded bytes
//     return DisplayPerfRpcInterface.getClient().savePng(fileName, data);
//   }
// }
function renderFrameWithNoAccuSnap(vp: Viewport) {
  IModelApp.accuSnap.clear();
  // invalidate scene and redraw the frame to ensure that the viewport state is up to date before reading the image
  vp.invalidateScene();
  vp.renderFrame();
}

/**
 * Converts an imageBuffer to its url data: string representation, so it can be downloaded/stored.
 * @param imageBuffer image to convert
 */
function encodeToUrlData(imageBuffer?: ImageBuffer) {
  if (!imageBuffer) {
    return undefined;
  }

  // pass false to preserveAlpha
  // from iModelJs: If false, the alpha channel will be set to 255 (fully opaque). This is recommended when converting an already-blended image (e.g., one obtained from [[Viewport.readImage]]).
  return `data:image/png;base64,${imageBufferToBase64EncodedPng(
    imageBuffer,
    false
  )}`;
}
//测试Categories
async function testAllCategories() {
  const imodel:
    | IModelConnection
    | undefined = UiFramework.getIModelConnection();
  if (imodel) {
    const categories: Id64Array = [];

    // Only use categories with elements in them
    const selectUsedSpatialCategoryIds =
      "SELECT DISTINCT Category.Id as id from BisCore.GeometricElement3d WHERE Category.Id IN (SELECT ECInstanceId from BisCore.SpatialCategory)";
    for await (const row of imodel.query(selectUsedSpatialCategoryIds)) {
      categories.push(row.id);
    }
    const st: Set<string> = new Set<string>();
    for (const id of categories) {
      const cats = await imodel.elements.getProps(id);
      if (cats.length > 0) {
        st.add(cats[0].classFullName);
      }
    }

    alert("有categories个数=" + st.size.toString());
    for (const it of st.values()) {
      alert(it);
    }
  }
}

const recursiveWait = async (
  pred: () => boolean,
  repeater: () => Promise<void>
) => {
  if (pred()) {
    await BeDuration.wait(0);
    await repeater();
  }
};

export const waitForAllAsyncs = async (
  handlers: Array<{ pendingAsyncs: Set<string> }>
) => {
  const pred = () => handlers.some((h) => h.pendingAsyncs.size > 0);
  await recursiveWait(pred, async () => waitForAllAsyncs(handlers));
};

export const waitForPendingAsyncs = async (handler: {
  pendingAsyncs: Set<string>;
}) => {
  const initialAsyncs = [...handler.pendingAsyncs];
  const pred = () =>
    initialAsyncs.filter((initial) => handler.pendingAsyncs.has(initial))
      .length > 0;
  const recursiveWaitInternal = async (): Promise<void> =>
    recursiveWait(pred, recursiveWaitInternal);
  await recursiveWaitInternal();
};
export function generateBriefcase(id: number): Briefcase {
  const briefcase = new Briefcase();
  briefcase.briefcaseId = id;
  briefcase.wsgId = id.toString();
  return briefcase;
}
export function createBox(
  size: Point3d,
  categoryId?: Id64String,
  subCategoryId?: Id64String,
  renderMaterialId?: Id64String,
  geometryPartId?: Id64String
): GeometryStreamProps {
  const geometryStreamBuilder = new GeometryStreamBuilder();
  if (undefined !== categoryId && undefined !== subCategoryId) {
    geometryStreamBuilder.appendSubCategoryChange(subCategoryId);
    if (undefined !== renderMaterialId) {
      const geometryParams = new GeometryParams(categoryId, subCategoryId);
      geometryParams.materialId = renderMaterialId;
      geometryStreamBuilder.appendGeometryParamsChange(geometryParams);
    }
  }
  geometryStreamBuilder.appendGeometry(
    Box.createDgnBox(
      Point3d.createZero(),
      Vector3d.unitX(),
      Vector3d.unitY(),
      new Point3d(0, 0, size.z),
      size.x,
      size.y,
      size.x,
      size.y,
      true
    )!
  );

  if (undefined !== geometryPartId) {
    geometryStreamBuilder.appendGeometryPart3d(geometryPartId);
  }
  return geometryStreamBuilder.geometryStream;
}
async function createLine(
  editor: ElementEditor3d,
  model: Id64String,
  category: Id64String,
  // parentId?: string,
  code: CodeProps
): Promise<void> {
  let g = createBox(Point3d.create(1000, 1000, 1000));
  // add Geometry
  const geomArray: Arc3d[] = [
    Arc3d.createXY(Point3d.create(0, 0), 5),
    Arc3d.createXY(Point3d.create(5, 5), 2),
    Arc3d.createXY(Point3d.create(-5, -5), 20),
  ];

  const builder = new GeometryStreamBuilder();

  for (const geom of geomArray) {
    builder.appendGeometry(geom);
  }
  const props3d: GeometricElement3dProps = {
    classFullName: "Generic:PhysicalObject",
    model,
    category,
    code,
    //geom: builder.geometryStream,
    geom: g,
    userLabel: "taiyang1",
    placement: {
      origin: Point3d.createZero(),
      angles: YawPitchRollAngles.createDegrees(0, 0, 0),
      bbox: Range3d.fromJSON(),
    },
  };

  // if (parentId !== undefined)
  //   (props3d as any).parent = {
  //     id: parentId,
  //     relClassName: "bis.ElementOwnsChildElements",
  //   };
  // return editor.createElement(props3d, origin, angles, geomprops);
  return editor.createElement(props3d);
}
let myModel: string;
let create_id: string = "0x40000000001";
async function QueryCreateElement() {
  const imodel = UiFramework.getIModelConnection()!;
  const eles = await imodel.elements.getProps(create_id);
  if (eles.length > 0) {
    const prop = eles[0];
    // alert(prop.userLabel);
    // alert(prop.classFullName);
    console.log(prop);

      const viewCreator3d: ViewCreator3d = new ViewCreator3d(imodel);
  let view3d = await viewCreator3d.createDefaultView(
    {
      cameraOn: true,
      skyboxOn: true,
      useSeedView: true,
      standardViewId: StandardViewId.Front,
    },
    [create_id]
  );
  const vp = IModelApp.viewManager.selectedView!;
  if (!vp.view.isSpatialView) {
    return;
  }
  const view = vp.view as SpatialViewState;
  const proIds = view.modelSelector.models;

  IModelApp.viewManager.selectedView!.changeView(view3d);
  const vp2 = IModelApp.viewManager.selectedView!;
  vp2.addViewedModels(proIds);

  } else {
    alert("查询不到");
  }

  // const iModel = UiFramework.getIModelConnection()!;
  // const ms = await iModel.models.queryProps({});
  // const ids: string[] = [];
  // ms.forEach((m: ModelProps) => {
  //   if (m.id) {
  //     ids.push(m.id);
  //   }
  // });
  // alert(ids.length.toString());
  // const viewCreator3d: ViewCreator3d = new ViewCreator3d(iModel);
  // let view3d = await viewCreator3d.createDefaultView(
  //   {
  //     cameraOn: true,
  //     skyboxOn: true,
  //     useSeedView: true,
  //     standardViewId: StandardViewId.Front,
  //   },
  //   [myModel]
  // );
  // const v = IModelApp.viewManager.selectedView!;
  // v.changeView(view3d);
  // alert(myModel);
/////////////////////////////////////////////////////////
  // const es = await iModel.elements.queryProps({});
  // for (const e of es) {
  //   if (e.userLabel && e.userLabel === "taiyang1") {
  //     alert(e);
  //   }
  // }

  // const views = await iModel.views.queryProps({});
  // views.forEach((v: ViewDefinitionProps) => {
  //   console.log(v.code.value);
  // });
  //
  // const qres = await iModel.elements.queryProps({
  //   from: "bis.GeometricElement3d",
  // });
  // alert(qres.length.toString());
  // const v = IModelApp.viewManager.selectedView!;
  // for (const ele of qres) {
  //   if (ele.userLabel) {
  //     if (ele.userLabel === "taiyang1") {
  //       alert(ele.userLabel);
  //       alert(ele.id);
  //       const id = ele.id!;
  //       v.zoomToElements([id], { animateFrustumChange: true });
  //     }
  //   }
  // }
  // v.replaceViewedModels(myModel);
  // const models = await iModel.models.queryProps({});
  // alert(models.length.toString());
  // for (const m of models) {
  //   console.log(m.classFullName);
  // }
}

async function TestElementEdit() {
  const iModel = UiFramework.getIModelConnection()!;
  const editor = await ElementEditor3d.start(iModel);

  const modelCode = await iModel.editing.codes.makeModelCode(
    iModel.models.repositoryModelId,
    Guid.createValue()
  );
  const model = await iModel.editing.models.createAndInsertPhysicalModel(
    modelCode
  );
  myModel = model;

  const dictionaryModelId = await iModel.models.getDictionaryModel();
  const category = await iModel.editing.categories.createAndInsertSpatialCategory(
    dictionaryModelId,
    Guid.createValue(),
    { color: 0 }
  );

  const cr = Code.createEmpty();
  const code = new Code({
    ...cr,
    value: Guid.createValue(),
  });

  await createLine(editor, model, category, code);
  const r = new Range3d(0, 0, 0, 5, 5, 5);
  await editor.write();
  await iModel.editing.updateProjectExtents(r);
  await editor.end();

  assert(await iModel.editing.hasUnsavedChanges());

  await iModel.saveChanges("create element test"); // TODO: Move this after select statement when we fix the problem with querying uncommitted changes

  iModel.saveChanges("保存");
  alert("模型id=" + model);
  create_id = model;
  try {
    await iModel.models.load(model);
  } catch (e) {
    alert(e);
  }
  const viewCreator3d: ViewCreator3d = new ViewCreator3d(iModel);
  let view3d = await viewCreator3d.createDefaultView(
    {
      cameraOn: true,
      skyboxOn: true,
      useSeedView: true,
      standardViewId: StandardViewId.Front,
    },
    [model]
  );
  const vp = IModelApp.viewManager.selectedView!;
  if (!vp.view.isSpatialView) {
    return;
  }
  const view = vp.view as SpatialViewState;
  const proIds = view.modelSelector.models;

  IModelApp.viewManager.selectedView!.changeView(view3d);
  const vp2 = IModelApp.viewManager.selectedView!;
  vp2.addViewedModels(proIds);
}

async function TestBlankView() {
  const blankView = new BlankConnectionExample();
  //const iModel = UiFramework.getIModelConnection()!;
  const con = blankView.openBlankConnection();
  const viewState = blankView.createBlankView(con);
  const v = IModelApp.viewManager.selectedView!;
  v.changeView(viewState);
  const el: HTMLDivElement = document.createElement("div") as HTMLDivElement;
  el.textContent = "nihao";
  document.body.appendChild(el);

  RobotWorldApp.openView(el);
}
async function TestSavedView() {
  // const imodel = UiFramework.getIModelConnection()!;
  // SavedViewLayout.viewLayoutToProps();
  // const prop = await TestSavedView2020();
  // if (prop) {
  //   savedViewList.push(prop);
  // }
  const imodel = UiFramework.getIModelConnection()!;
  const requestContext = await AuthorizedFrontendRequestContext.create();
  const userResult = await IModelApp.settings.saveUserSetting(
    requestContext,
    "NBA2020",
    "NineZoneSample",
    "huren",
    true,
    imodel.contextId,
    imodel.iModelId
  );
  if (userResult.status === SettingsStatus.Success) {
    alert("保存成功");
  } else {
    alert("保存失败");
  }
}
async function TestSavedViewNi() {
  // const vp = IModelApp.viewManager.selectedView!;
  // for (const p of savedViewList) {
  //   const sv = await TestSavedViewNi2020(p);
  //   if (sv) {
  //     vp.changeView(sv);
  //     alert("保存成功");
  //   }
  // }
  const imodel = UiFramework.getIModelConnection()!;
  // alert(imodel.name);
  // alert(imodel.contextId);
  // alert(imodel.iModelId);
  // console.log(imodel);
  const requestContext = await AuthorizedFrontendRequestContext.create();
  const userResult = await IModelApp.settings.getUserSettingsByNamespace(
    requestContext,
    "NineZoneSample",
    true,
    imodel.contextId,
    imodel.iModelId
  );
  if (userResult.status == SettingsStatus.Success && userResult.settingsMap) {
    alert("获取设置成功");
    console.log(userResult.settingsMap);
  } else {
    alert("获取设置失败");
  }
}

class DebugToolTipProvider implements ToolTipProvider {
  private static _instance?: DebugToolTipProvider;

  public async augmentToolTip(
    hit: HitDetail,
    tooltipPromise: Promise<HTMLElement | string>
  ): Promise<HTMLElement | string> {
    // discard and overwrite
    await tooltipPromise;

    const keys: Array<keyof HitDetail> = [
      "sourceId",
      "modelId",
      "subCategoryId",
      "tileId",
      "geometryClass",
      "distXY",
    ];
    let html = "";
    //const iModel = UiFramework.getIModelConnection()!;
    // const id = hit["sourceId"];
    // if (iModel.selectionSet.has(id)) {
    // } else {
    //   iModel.selectionSet.add(id);
    // }
    // const vp = IModelApp.viewManager.selectedView!;
    // vp.zoomToElements(hit["sourceId"]);
    for (const key of keys) {
      const value = hit[key];
      if (undefined === value) continue;

      html = html + key + ": " + value.toString() + "<br>";
    }

    const div = document.createElement("div");
    div.innerHTML = html;
    return div;
  }

  public static setEnabled(enabled: boolean | undefined): void {
    if (undefined === enabled) enabled = undefined === this._instance;

    if (enabled) {
      if (undefined === this._instance) {
        this._instance = new DebugToolTipProvider();
        IModelApp.viewManager.addToolTipProvider(this._instance);
      }
    } else if (undefined !== this._instance) {
      IModelApp.viewManager.dropToolTipProvider(this._instance);
      this._instance = undefined;
    }
  }
}
// *  processSelectionSetEvent(ev: SelectionSetEvent): void {
//   *    if (SelectionSetEventType.Add === ev.type || SelectionSetEventType.Replace === ev.type)
//   *      console.log("Added " + ev.added.size + " elements");
//   *
//   *    if (SelectionSetEventType.Add !== ev.type)
//   *      console.log("Removed " + ev.removed.size + " elements");
//   *  }
async function processSelectionSetEvent(ev: SelectionSetEvent) {
  if (SelectionSetEventType.Replace === ev.type) {
    const vp = IModelApp.viewManager.selectedView!;
    vp.zoomToElements(ev.added);
  }
  // alert(ev.type);
}
//测试ViewManager
async function TestSerializationView() {
  const vp = IModelApp.viewManager.selectedView!.view;
  const viewProp = SavedView.viewStateToProps(vp);

  const imodel = UiFramework.getIModelConnection()!;
  const requestContext = await AuthorizedFrontendRequestContext.create();
  const userResult = await IModelApp.settings.saveUserSetting(
    requestContext,
    viewProp,
    "NineZoneSample",
    "SaveView1",
    true,
    imodel.contextId,
    imodel.iModelId
  );
  if (userResult.status === SettingsStatus.Success) {
    alert("保存成功");
  } else {
    alert("保存失败");
  }
}

//测试从云上获取viewstate
async function TestDeserializationView() {
  const imodel = UiFramework.getIModelConnection()!;
  const requestContext = await AuthorizedFrontendRequestContext.create();
  const userResult = await IModelApp.settings.getUserSettingsByNamespace(
    requestContext,
    "NineZoneSample",
    true,
    imodel.contextId,
    imodel.iModelId
  );
  if (userResult.status == SettingsStatus.Success && userResult.settingsMap) {
    if (userResult.settingsMap && userResult.settingsMap.get("SaveView1")) {
      const v: SavedViewProps | undefined = userResult.settingsMap.get(
        "SaveView1"
      ) as SavedViewProps;
      if (v) {
        const state = await SavedView.viewStateFromProps(imodel, v);
        const vp = IModelApp.viewManager.selectedView!;
        vp.changeView(state!);
      }
    }
  } else {
    alert("获取设置失败");
  }
}
