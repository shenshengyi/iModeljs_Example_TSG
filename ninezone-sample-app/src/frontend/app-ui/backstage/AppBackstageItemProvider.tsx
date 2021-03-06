/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { IModelApp } from "@bentley/imodeljs-frontend";
import { BackstageItem, BackstageItemUtilities } from "@bentley/ui-abstract";

export class AppBackstageItemProvider {
  /** id of provider */
  public readonly id = "ninezone-sample-app.AppBackstageItemProvider";

  private _backstageItems: ReadonlyArray<BackstageItem> | undefined = undefined;

  public get backstageItems(): ReadonlyArray<BackstageItem> {
    if (!this._backstageItems) {
      this._backstageItems = [
        BackstageItemUtilities.createStageLauncher(
          "SampleFrontstage",
          100,
          10,
          IModelApp.i18n.translate("NineZoneSample:backstage.sampleFrontstage"),
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "SampleFrontstage2",
          100,
          20,
          IModelApp.i18n.translate(
            "NineZoneSample:backstage.sampleFrontstage2"
          ),
          undefined,
          "icon-placeholder"
        ),

        BackstageItemUtilities.createStageLauncher(
          "ViewsFrontstage",
          100,
          30,
          "测试Viewer",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "TestFeatureState",
          100,
          40,
          "测试个人View",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "LoadingStage",
          100,
          50,
          "测试Loading",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "UIViewportFrontstage",
          100,
          60,
          "测试UI",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "FrontstageId.IModelIndexStage",
          100,
          70,
          "模型索引",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "TableFrontstage",
          100,
          80,
          "表格显示imodel内容",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "TreeFrontstage",
          100,
          90,
          "树形显示imodel内容",
          undefined,
          "icon-placeholder"
        ),
        BackstageItemUtilities.createStageLauncher(
          "SavedViewFrontstage1",
          200,
          10,
          "测试SavedView",
          undefined,
          "icon-placeholder"
        ),
      ];
    }
    return this._backstageItems;
  }
}
