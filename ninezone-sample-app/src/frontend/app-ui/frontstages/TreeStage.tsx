/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  ViewState,
  ViewState2d,
  SpatialViewState,
  ModelSelectorState,
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
} from "@bentley/ui-framework";
import * as React from "react";
import { Table, Button } from "antd";
import { AppUi } from "../AppUi";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import "./TableNodeTree.css";

import { Tree, Switch } from "antd";
import { CarryOutOutlined, FormOutlined } from "@ant-design/icons";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import { FillCentered } from "@bentley/ui-core";
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

const treeData = [
  {
    title: "parent 1",
    key: "0-0",
    icon: <CarryOutOutlined />,
    children: [
      {
        title: "parent 1-0",
        key: "0-0-0",
        icon: <CarryOutOutlined />,
        children: [
          { title: "leaf", key: "0-0-0-0", icon: <CarryOutOutlined /> },
          { title: "leaf", key: "0-0-0-1", icon: <CarryOutOutlined /> },
          { title: "leaf", key: "0-0-0-2", icon: <CarryOutOutlined /> },
        ],
      },
      {
        title: "parent 1-1",
        key: "0-0-1",
        icon: <CarryOutOutlined />,
        children: [
          { title: "leaf", key: "0-0-1-0", icon: <CarryOutOutlined /> },
        ],
      },
      {
        title: "parent 1-2",
        key: "0-0-2",
        icon: <CarryOutOutlined />,
        children: [
          { title: "leaf", key: "0-0-2-0", icon: <CarryOutOutlined /> },
          {
            title: "leaf",
            key: "0-0-2-1",
            icon: <CarryOutOutlined />,
            switcherIcon: <FormOutlined />,
          },
        ],
      },
    ],
  },
  {
    title: "parent 2",
    key: "0-1",
    icon: <CarryOutOutlined />,
    children: [
      {
        title: "parent 2-0",
        key: "0-1-0",
        icon: <CarryOutOutlined />,
        children: [
          { title: "leaf", key: "0-1-0-0", icon: <CarryOutOutlined /> },
          { title: "leaf", key: "0-1-0-1", icon: <CarryOutOutlined /> },
        ],
      },
    ],
  },
];

class MyTree extends React.Component {
  public constructor() {
    super({});
  }
  public render() {
    return (
      <FillCentered>
        <Tree
          showLine={true}
          showIcon={false}
          defaultExpandedKeys={["0-0-0"]}
          treeData={treeData}
          defaultExpandAll={true}
        />
      </FillCentered>
    );
  }
}
ConfigurableUiManager.registerControl(TreeStageContent.ID, TreeStageContent);
