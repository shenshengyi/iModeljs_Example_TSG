/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ViewState,
  ViewState2d,
  SpatialViewState,
} from "@bentley/imodeljs-frontend";
import {
  ContentGroup,
  ContentLayoutDef,
  CoreTools,
  Frontstage,
  FrontstageProvider,
  UiFramework,
  Zone,
  Widget,
  ItemList,
  ToolWidget,
  ContentControl,
  ConfigurableCreateInfo,
  ConfigurableUiManager,
  getIsHiddenIfFeatureOverridesActive,
} from "@bentley/ui-framework";
import * as React from "react";
import { Button } from "antd";
import { AppUi } from "../AppUi";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "./TableNodeTree.css";

import { Tree } from "antd";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import { FillCentered } from "@bentley/ui-core";
import { getInputClassName } from "antd/lib/input/Input";
import { Data } from "electron";
import { DraggedTabContext } from "@bentley/ui-ninezone";
/**
 * Sample Frontstage for 9-Zone sample application
 */
export class TreeFrontstage extends FrontstageProvider {
  // Content layout for content views
  private _contentLayoutDef: ContentLayoutDef;

  // Content group for both layouts
  private _contentGroup: ContentGroup;

  constructor(public viewStates: ViewState[]) {
    super();

    // Create the content layouts.
    this._contentLayoutDef = new ContentLayoutDef({});

    // Create the content group.
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: TreeStageContent.ID,
          applicationData: {
            viewState: this.viewStates[0],
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
      ],
    });
  }

  /** Define the Frontstage properties */
  public get frontstage() {
    return (
      <Frontstage
        id="TreeFrontstage"
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={this._contentLayoutDef}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        topLeft={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<SampleToolWidget />} />,
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

class TreeStageContent extends ContentControl {
  public static ID = "TreeStageContent";
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = <MyTree />;
    }
  }
}
interface DataInterface {
  title: string;
  key: string;
  children?: DataInterface[];
}
function GetInitData() {
  const treeData: DataInterface[] = [
    {
      title: "NBA",
      key: "0-0",
    },
  ];
  return treeData;
}
async function Get2DModel(
  view: ViewState2d
): Promise<DataInterface | undefined> {
  const modelId = view.baseModelId;
  const imodel = UiFramework.getIModelConnection()!;
  const modelProps = await imodel.models.getProps(modelId);
  if (modelProps.length > 0) {
    return {
      title: modelProps[0].classFullName,
      key: modelProps[0].id,
    } as DataInterface;
  }
  return undefined;
}
async function Get3DModel(
  view: SpatialViewState
): Promise<DataInterface[] | undefined> {
  const datas: DataInterface[] = [];
  const imodel = UiFramework.getIModelConnection()!;
  const models = view.modelSelector.models;
  for (const modelId of models.values()) {
    const modelProps = await imodel.models.getProps(modelId);
    if (modelProps.length > 0) {
      datas.push({
        title: modelProps[0].classFullName,
        key: modelProps[0].id!,
      });
    }
  }

  if (datas.length > 0) {
    return datas;
  }
  return undefined;
}
async function GetCategory(
  view: ViewState
): Promise<DataInterface[] | undefined> {
  const datas: DataInterface[] = [];
  const imodel = UiFramework.getIModelConnection()!;
  const categories = view.categorySelector.categories;
  for (const categorId of categories.values()) {
    const props = await imodel.elements.getProps(categorId);
    if (props.length > 0) {
      datas.push({ title: props[0].id!, key: props[0].id! });
    }
  }
  if (datas.length > 0) {
    return datas;
  }
  return undefined;
}
async function GetData() {
  const treeData: DataInterface[] = [];
  const imodel = UiFramework.getIModelConnection();
  if (imodel == undefined) {
    return treeData;
  }

  const views = await imodel.views.getViewList({});
  for (const view of views) {
    const viewstate = await imodel.views.load(view.id);
    let data: DataInterface = {
      title: viewstate.classFullName,
      key: viewstate.id,
      children: [],
    };
    if (viewstate instanceof ViewState2d) {
      const v2d: ViewState2d = viewstate as ViewState2d;
      const c = await Get2DModel(v2d);
      if (c != undefined) {
        data.children!.push(c);
      }
    } else if (viewstate instanceof SpatialViewState) {
      const v3d: SpatialViewState = viewstate as SpatialViewState;
      const c = await Get3DModel(v3d);
      if (c != undefined) {
        data.children!.push(...c);
      }
    }
    const d = await GetCategory(viewstate);
    if (d != undefined) {
      data.children!.push(...d);
    }
    treeData.push(data);
  }
  // treeData.push({
  //   title: "NBA",
  //   key: "0-0",
  //   children: [
  //     {
  //       title: "东部",
  //       key: "0-0-0",
  //       children: [
  //         { title: "76人", key: "0-0-0-0" },
  //         { title: "猛龙", key: "0-0-0-1" },
  //         { title: "公牛", key: "0-0-0-2" },
  //       ],
  //     },
  //     {
  //       title: "西部",
  //       key: "0-0-1",
  //       children: [{ title: "湖人", key: "0-0-1-0" }],
  //     },
  //   ],
  // });
  return treeData;
}
interface MyTreeState {
  treeData: DataInterface[];
}
const ming = true;
class MyTree extends React.Component<{}, MyTreeState> {
  public constructor() {
    super({});
    this.state = { treeData: GetInitData() };
    this.OnClick.bind(this);
  }
  private OnClick = async () => {
    const data = await GetData();

    this.setState({ treeData: [...data] });
  };

  public render() {
    return (
      <FillCentered>
        <Button onClick={this.OnClick}>获得数据</Button>
        <Tree
          showLine={true}
          showIcon={false}
          defaultExpandedKeys={["0-0-0"]}
          treeData={this.state.treeData}
          defaultExpandAll={true}
        />
      </FillCentered>
    );
  }
}
ConfigurableUiManager.registerControl(TreeStageContent.ID, TreeStageContent);
