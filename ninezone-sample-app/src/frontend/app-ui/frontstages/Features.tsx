import {
  IModelApp,
  EmphasizeElements,
  FeatureOverrideProvider,
  FeatureSymbology,
  Viewport,
  ViewChangeOptions,
  ZoomToOptions,
  PrimitiveTool,
  BeButtonEvent,
  EventHandled,
  AccuSnap,
  ViewClipClearTool,
  ViewClipDecorationProvider,
  ScreenViewport,
  FitViewTool,
  IModelConnection,
  SpatialViewState,
  DrawingViewState,
  DrawingModelState,
  SheetModelState,
  SectionDrawingModelState,
  ViewState2d,
  DisplayStyle3dState,
  DisplayStyle2dState,
  Tool,
  Environment,
  Decorator,
  DecorateContext,
  GraphicType,
  ViewRect,
  HitDetail,
  LocateFilterStatus,
  LocateResponse,
  BeWheelEvent,
  imageBufferToBase64EncodedPng,
  canvasToImageBuffer,
  ParseAndRunResult,
  ElementEditor3d,
  AuthorizedFrontendRequestContext,
  RemoteBriefcaseConnection,
  SelectionSetEvent,
  SpatialModelState,
  GeometricModelState,
} from "@bentley/imodeljs-frontend";
import {
  ItemList,
  CommandItemDef,
  UiFramework,
  useActiveIModelConnection,
  FrontstageManager,
} from "@bentley/ui-framework";
import {
  ColorDef,
  ViewStateProps,
  IModel,
  Code,
  ViewDefinition2dProps,
  SubCategoryOverride,
  DisplayStyleSettingsProps,
  DisplayStyle3dSettingsProps,
  ImageBuffer,
  ModelQueryParams,
  ModelProps,
} from "@bentley/imodeljs-common";
import {
  Id64String,
  Id64,
  BeDuration,
  isInstanceOf,
  Id64Array,
  Config,
  OpenMode,
} from "@bentley/bentleyjs-core";
import {
  ClipVector,
  Point3d,
  ClipShape,
  ClipMaskXYZRangePlanes,
  Range3d,
  YawPitchRollAngles,
  IModelJson,
  LineSegment3d,
  XAndY,
} from "@bentley/geometry-core";
import {
  DisplayStyle3d,
  Category,
  DrawingModel,
  PhysicalModel,
} from "@bentley/imodeljs-backend";
import React from "react";
import ReactDOM from "react-dom";
import DynamicLink from "./DynamicLink";
import { NineZoneSampleApp } from "../../app/NineZoneSampleApp";
import {
  AccessToken,
  AuthorizedClientRequestContext,
} from "@bentley/itwin-client";
import {
  ContextRegistryClient,
  Project,
} from "@bentley/context-registry-client";
import { IModelQuery, VersionQuery, Version } from "@bentley/imodelhub-client";
import {
  Presentation,
  SelectionChangeEventArgs,
} from "@bentley/presentation-frontend";
import { promises } from "fs";
import { SimplePropertyDataProvider } from "@bentley/ui-components";
import { WidgetState } from "@bentley/ui-abstract";
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
    ),
    TestFeature.CreateCommand(
      "TestElementEdit",
      "测试元素编辑",
      TestElementEdit
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
//建立活动特性覆盖来强调元素，并应用颜色/透明度覆盖。

class MyProvider implements FeatureOverrideProvider {
  public id: string = "MyProvider";
  public addFeatureOverrides(
    ovrs: FeatureSymbology.Overrides,
    vp: Viewport
  ): void {
    /* ... */
    alert(ovrs.alwaysDrawn);
    alert(vp.alwaysDrawn);
  }
  //0x400000003cc
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

class MyTool extends PrimitiveTool {
  public static toolId = "MyTool";
  public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...
  private _createMarkerCallback: (pt: Point3d) => {};
  constructor(callback: (pt: Point3d) => {}) {
    super();
    this._createMarkerCallback = callback;
  }
  public isCompatibleViewport(
    vp: Viewport | undefined,
    isSelectedViewChange: boolean
  ): boolean {
    return (
      super.isCompatibleViewport(vp, isSelectedViewChange) &&
      undefined !== vp &&
      vp.view.isSpatialView()
    );
  }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean {
    return true;
  } // Allow snapping to terrain, etc. outside project extents.
  public requireWriteableTarget(): boolean {
    return false;
  } // Tool doesn't modify the imodel.
  public onPostInstall() {
    super.onPostInstall();
    this.setupAndPromptForNextAction();
  }
  public onRestartTool(): void {
    this.exitTool();
  }

  protected setupAndPromptForNextAction(): void {
    // Accusnap adjusts the effective cursor location to 'snap' to geometry in the view
    IModelApp.accuSnap.enableSnap(true);
  }

  // A reset button is the secondary action button, ex. right mouse button.
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }

  // A data button is the primary action button, ex. left mouse button.
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    if (undefined === ev.viewport) return EventHandled.No; // Shouldn't really happen

    // ev.point is the current world coordinate point adjusted for snap and locks
    this._createMarkerCallback(ev.point);

    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
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
  IModelApp.tools.run(ToggleSkyboxTool.toolId); //ToggleSkyboxTool
}
//测试view
async function TestView() {
  const imodel = UiFramework.getIModelConnection();
  const models = await imodel!.models.queryProps({
    from: "BisCore.GeometricModel2d",
  });
  if (models.length == 0) {
    alert("模型为空");
    return;
  }
  const model = models[1];
  const props = await CreateViewStateProps(model.id!, ColorDef.green);
  let viewState: ViewState2d | undefined = DrawingViewState.createFromProps(
    props,
    UiFramework.getIModelConnection()!
  ) as ViewState2d;

  if (viewState) await viewState.load();

  const vp = IModelApp.viewManager.selectedView;

  vp!.changeView(viewState);
}
async function getAllCategories() {
  const allDrawingCategories =
    "SELECT ECInstanceId from BisCore.DrawingCategory";
  const imodel = UiFramework.getIModelConnection();
  const rows = [];
  for await (const row of imodel!.query(allDrawingCategories)) {
    rows.push(row.id);
  }
  return rows;
}
async function CreateViewStateProps(
  modelId: Id64String,
  bgColor: ColorDef
): Promise<ViewStateProps> {
  const dictionaryId = IModel.dictionaryId;

  const categories = await getAllCategories();
  const imodel = UiFramework.getIModelConnection();
  const modelProps = await imodel!.models.queryModelRanges(modelId);
  const modelExtents = Range3d.fromJSON(modelProps[0]);

  let originX = modelExtents.low.x;
  let originY = modelExtents.low.y;
  let deltaX = modelExtents.xLength();
  let deltaY = modelExtents.yLength();

  const modelSelectorProps = {
    models: [modelId],
    code: Code.createEmpty(),
    model: dictionaryId,
    classFullName: "BisCore:ModelSelector",
  };

  const categorySelectorProps = {
    categories,
    code: Code.createEmpty(),
    model: dictionaryId,
    classFullName: "BisCore:CategorySelector",
  };

  const viewDefinitionProps: ViewDefinition2dProps = {
    baseModelId: modelId,
    categorySelectorId: "",
    displayStyleId: "",
    origin: { x: originX, y: originY },
    delta: { x: deltaX, y: deltaY },
    angle: { radians: 0 },
    code: Code.createEmpty(),
    model: dictionaryId,
    classFullName: "BisCore:ViewDefinition2d",
  };
  const displayStyleProps = {
    code: Code.createEmpty(),
    model: dictionaryId,
    classFullName: "BisCore:DisplayStyle",
    jsonProperties: {
      styles: {
        backgroundColor: bgColor.toJSON(),
      },
    },
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
  private showLocateMessage(
    viewPt: XAndY,
    vp: ScreenViewport,
    msg: HTMLElement | string
  ) {
    if (IModelApp.viewManager.doesHostHaveFocus) vp.openToolTip(msg, viewPt);
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

async function getIModelInfo() {
  const imodelName = Config.App.get("imjs_test_imodel");
  const projectName = Config.App.get("imjs_test_project", imodelName);

  const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();
  const connectClient = new ContextRegistryClient();
  let project: Project;
  try {
    project = await connectClient.getProject(requestContext, {
      $filter: `Name+eq+'${projectName}'`,
    });
  } catch (e) {
    throw new Error(`Project with name "${projectName}" does not exist`);
  }
  const imodelQuery = new IModelQuery();
  imodelQuery.byName(imodelName);
  const imodels = await IModelApp.iModelClient.iModels.get(
    requestContext,
    project.wsgId,
    imodelQuery
  );

  if (imodels.length === 0) {
    throw new Error(
      `iModel with name "${imodelName}" does not exist in project "${projectName}"`
    );
  }
  const mm = imodels[0];
  alert(project.wsgId);
  alert(mm.wsgId);
  const filePath = "D:\\imodelhub_DownLoad\\";
  // await IModelApp.iModelClient.iModels.download(
  //   requestContext,
  //   project.wsgId,
  //   filePath
  // );
  // const myiModel = await RemoteBriefcaseConnection.open(
  //   project.wsgId,
  //   mm.wsgId,
  //   OpenMode.Readonly
  // );
  // if (myiModel) {
  //   alert("打开成功");
  // }
  // const contextId = myiModel.contextId;
  // await IModelApp.iModelClient.iModels.download(
  //   requestContext,
  //   contextId,
  //   filePath
  // );
  // const pngImage = await IModelApp.iModelClient.thumbnails.download(
  //   requestContext,
  //   myiModel.iModelId,
  //   { contextId: contextId!, size: "Small" }
  // );
  // if (pngImage) {
  //   alert("文件下载成功");
  //   alert(pngImage);
  // } else {
  //   alert("文件下载失败");
  // }
  // const ver = await IModelApp.iModelClient.versions.get(
  //   requestContext,
  //   myiModel.iModelId
  // );
  // if (ver.length > 0) {
  //   alert(ver[0].name);
  // }
  // await myiModel.close();
}
function NoY(ev: SelectionSetEvent): void {
  alert("修改元素了");
  console.log(ev);
}

const onSelectionChanged = async (args: SelectionChangeEventArgs) => {
  if (!IModelApp.viewManager.selectedView) {
    // no viewport to zoom in
    return;
  }
  // alert(args.source);
  // if (args.source === "Tool") {
  //   // selection originated from the viewport - don't change what it's displaying by zooming in
  //   return;
  // }
  // alert("明月");
  // determine what the viewport is hiliting
  const hiliteSet = await Presentation.selection.getHiliteSet(args.imodel);
  if (hiliteSet.elements) {
    // note: the hilite list may contain models and subcategories as well - we don't
    // care about them at this moment
    await IModelApp.viewManager.selectedView.zoomToElements(hiliteSet.elements);
    // alert(hiliteSet.elements);
  }
};
//测试元素编辑
let i = 0;
let selectionListener: () => void;
async function TestElementEdit() {
  const str = UiFramework.translate("selectionScopeField.label");
  alert(str);
  // public static get verticalPropertyGridOpenCommand() {
  //   return new CommandItemDef({
  //     commandId: "verticalPropertyGridOpen",
  //     iconSpec: "icon-placeholder",
  //     labelKey: "SampleApp:buttons.openPropertyGrid",
  //     tooltip: "Open Vertical PropertyGrid (Tooltip)",
  //     execute: async () => {
  //       const activeFrontstageDef = FrontstageManager.activeFrontstageDef;
  //       if (activeFrontstageDef) {
  //         const widgetDef = activeFrontstageDef.findWidgetDef("VerticalPropertyGrid");
  //         if (widgetDef) {
  //           widgetDef.setWidgetState(WidgetState.Open);
  //         }
  //       }
  //     },
  //   });
  // }
  // const activeFrontstageDef = FrontstageManager.activeFrontstageDef;
  // if (activeFrontstageDef) {
  //   const widgetDef = activeFrontstageDef.findWidgetDef("VerticalPropertyGrid");
  //   if (widgetDef) {
  //     widgetDef.setWidgetState(WidgetState.Open);
  //   }
  // }
  // if (i % 2 == 0) {
  //   selectionListener = Presentation.selection.selectionChange.addListener(
  //     onSelectionChanged
  //   );
  // } else {
  //   // Presentation.selection.selectionChange.removeListener(selectionListener);
  //   selectionListener();
  // }
  // i++;
  // SimplePropertyDataProvider;
  // const modelQueryParams: ModelQueryParams = {
  //   from: PhysicalModel.classFullName,
  //   wantPrivate: false,
  // };
  // const imodel = UiFramework.getIModelConnection()!;
  // // const models = await imodel.models.queryProps(modelQueryParams);
  // // for (const p of models) {
  // //   alert(p.classFullName);
  // // }
  // const viewSpecs = await imodel.views.getViewList({});
  // const viewIds = viewSpecs.map((spec: IModelConnection.ViewSpec) => {
  //   return spec.id!;
  // });
  // // alert("view number =" + viewIds.length.toString());
  // const viewState = await imodel.views.load(viewIds[2]);
  // IModelApp.viewManager.selectedView!.changeView(viewState);
  // const modelIDs = models.map((model: ModelProps) => {
  //   return model.id!;
  // });
  // alert("模型个数=" + models.length.toString());
  // alert(modelIDs[0]);
  // return { selectionCount: frameworkState.sessionState.numItemsSelected };
  // const imodel = UiFramework.getIModelConnection();
  // if (imodel) {
  //   alert(imodel.name);
  // } else {
  //   alert("imodel is error");
  // }
  // await getIModelInfo();
  // if (i == 0) {
  //   UiFramework.getIModelConnection()!.selectionSet.onChanged.addListener(NoY);
  // }
  // IModelApp.viewManager.setViewCursor(IModelApp.viewManager.grabCursor);
  // i++;
  // const id = "0x20000000001";
  // const imodel = UiFramework.getIModelConnection();
  // const props = await imodel!.elements.getProps(id);
  // if (props.length > 0) {
  //   const prop = props[0];
  //   await Presentation.selection.addToSelectionWithScope(
  //     "",
  //     imodel!,
  //     prop.id!,
  //     "element"
  //   );
  //   const selection = Presentation.selection.getSelection(imodel!);
  //   const re = selection.has({
  //     className: "BisCore:Model",
  //     id: prop.id!,
  //   });
  //   if (re) {
  //     alert("拥有");
  //   } else {
  //     alert("没有");
  //   }
  // } else {
  //   alert("没有找到元素");
  // }
  // IModelApp.settings;
  // const tool = IModelApp.toolAdmin.activeSettings.category;
  // alert(tool);
  // if (typeof window !== "undefined") {
  //   alert("if (typeof window !== undefined");
  // } else {
  //   alert("if (typeof window======= undefined");
  // }
  // const accessToken = await IModelApp.authorizationClient!.getAccessToken();
  // IModelApp.iModelClient.versions;
  // const path = "D:/imodelhub_DownLoad/";
  // await getIModelInfo();
  // const p = await getIModelInfo();
  // alert("p = " + p.projectId);
  // const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();
  // await IModelApp.iModelClient.iModel.download(
  //   requestContext,
  //   p.projectId,
  //   path
  // );
  // let iModel = UiFramework.getIModelConnection();
  // if (iModel!.isReadonly) {
  //   alert("imodel是只读的");
  // } else {
  //   alert("imodel可读可写");
  // }
  // const editor = await ElementEditor3d.start(iModel!);
  // const modelCode = await iModel!.editing.codes.makeModelCode(
  //   iModel!.models.repositoryModelId,
  //   "TestModel1"
  // );
  // const model = await iModel!.editing.models.createAndInsertPhysicalModel(
  //   modelCode
  // );
  // const dictionaryModelId = await iModel!.models.getDictionaryModel();
  // const category = await iModel!.editing.categories.createAndInsertSpatialCategory(
  //   dictionaryModelId,
  //   "TestCategory1",
  //   { color: 0 }
  // );
  // const line = makeLine();
  // const geomprops = IModelJson.Writer.toIModelJson(line);
  // const origin = line.point0Ref;
  // const angles = new YawPitchRollAngles();
  // const props3d = {
  //   classFullName: "Generic:PhysicalObject",
  //   model,
  //   category,
  //   code: Code.createEmpty(),
  // };
  // await editor.createElement(props3d, origin, angles, geomprops);
  // await editor.write();
  // await editor.end();
  // // assert(await iModel.editing.hasUnsavedChanges());
  // await iModel!.saveChanges("create element test");
  // // assert.isTrue(await iModel.editing.hasPendingTxns());
  // // assert.isFalse(await iModel.editing.hasUnsavedChanges());
  // alert("编辑完成");
}
function makeLine(p1?: Point3d, p2?: Point3d): LineSegment3d {
  return LineSegment3d.create(
    p1 || new Point3d(0, 0, 0),
    p2 || new Point3d(0, 0, 0)
  );
}
