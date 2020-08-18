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
import { FillCentered } from "@bentley/ui-core";
/**
 * Sample Frontstage for 9-Zone sample application
 */
export class TableFrontstage extends FrontstageProvider {
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
          classId: TableStageContent.ID,
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
        id="TableFrontstage"
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

interface ModelInfoDataInterface {
  key: string;
  ID: string;
  ClassFullName: string;
  ClassName: string;
}
interface ViewInfoDataInterface {
  key: string;
  ID: string;
  ClassFullName: string;
  Name: string;
  includeModels: string;
}
async function GetModelInfo() {
  const infos: ModelInfoDataInterface[] = [];

  const imodel = UiFramework.getIModelConnection();
  if (imodel == undefined) {
    return infos;
  }

  const ModelProps = await imodel.models.queryProps({});
  if (ModelProps) {
    for (const props of ModelProps) {
      infos.push({
        key: props.id!,
        ID: props.id!,
        ClassFullName: props.classFullName,
        ClassName: props.name!,
      });
    }
  }

  // const ps = await imodel.models.getProps("0xe");
  // if (ps.length > 0) {
  //   infos.push({
  //     key: ps[0].id!,
  //     ID: ps[0].id!,
  //     ClassFullName: ps[0].classFullName,
  //     ClassName: ps[0].name!,
  //   });
  // }
  // const ps1 = await imodel.models.getProps("0x10");
  // if (ps.length > 0) {
  //   infos.push({
  //     key: ps1[0].id!,
  //     ID: ps1[0].id!,
  //     ClassFullName: ps1[0].classFullName,
  //     ClassName: ps1[0].name!,
  //   });
  // }

  return infos;
}
class TableStageContent extends ContentControl {
  public static ID = "TableContent";
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = <MyTable />;
    }
  }
}

interface MyTableState {
  ModelInfos: ModelInfoDataInterface[];
}

class MyTable extends React.Component<{}, MyTableState> {
  public constructor() {
    super({});
    this.onClick.bind(this);
    this.state = { ModelInfos: [] };
  }

  static ModelInfoColumns = [
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
    },
    {
      title: "ClassFullName",
      dataIndex: "ClassFullName",
      key: "ClassFullName",
    },
    {
      title: "ClassName",
      dataIndex: "ClassName",
      key: "ClassName",
    },
  ];

  private onClick = async () => {
    const models = await GetModelInfo();
    this.setState({ ModelInfos: models });
  };
  public render() {
    return (
      <FillCentered>
        <div>
          <Button onClick={this.onClick}>获取信息</Button>
          <Table
            dataSource={this.state.ModelInfos}
            columns={MyTable.ModelInfoColumns}
          />
        </div>
      </FillCentered>
    );
  }
}
async function GetModel(view: ViewState) {
  const imodel = UiFramework.getIModelConnection();
  if (imodel == undefined) {
    return "";
  }
  if (view instanceof ViewState2d) {
    const v2d: ViewState2d = view as ViewState2d;
    const baseModel = v2d.baseModelId;
    const prop = await imodel.models.getProps(baseModel);
    if (prop.length > 0) {
      return `(${prop[0].classFullName}   ${prop[0].name}`;
    } else {
      return "";
    }
  } else if (view instanceof SpatialViewState) {
    const v3d: SpatialViewState = view as SpatialViewState;
    const modelSelect: ModelSelectorState = v3d.modelSelector;
    const modelSet = modelSelect.models;
    let str: string[] = [];
    for (const id of modelSet.values()) {
      const prop = await imodel.models.getProps(id);
      if (prop.length > 0) {
        const s = `(${prop[0].classFullName}   ${prop[0].name} + `;
        str.push(s);
      }
    }
    return str.toString();
  }
  return "";
}

ConfigurableUiManager.registerControl(TableStageContent.ID, TableStageContent);
