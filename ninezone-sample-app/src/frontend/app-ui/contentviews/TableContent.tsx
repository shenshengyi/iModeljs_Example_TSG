/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";

import {
  ConfigurableCreateInfo,
  ContentControl,
  ConfigurableUiManager,
} from "@bentley/ui-framework";

import SimpleTableComponent from "../../components/Table";

/**
 * Table content
 */
export class TableContent extends ContentControl {
  public static ID = "MY_TableContent";
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = (
        <SimpleTableComponent imodel={options.iModelConnection} />
      );
    }
  }
}
ConfigurableUiManager.registerControl(TableContent.ID, TableContent);
