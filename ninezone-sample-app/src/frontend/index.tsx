/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Logger, LogLevel } from "@bentley/bentleyjs-core";

import { AppLoggerCategory } from "../common/LoggerCategory";
import { NineZoneSampleApp } from "./app/NineZoneSampleApp";
import { AppUi } from "./app-ui/AppUi";
import App from "./components/App";
import "./index.scss";
import { Button } from "@bentley/ui-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
// Setup logging immediately to pick up any logging during NineZoneSampleApp.startup()
Logger.initializeToConsole();
Logger.setLevelDefault(LogLevel.Warning);
Logger.setLevel(AppLoggerCategory.Frontend, LogLevel.Info);

(async () => {
  // Start the app.
  await NineZoneSampleApp.startup();

  // Initialize the AppUi & ConfigurableUiManager
  AppUi.initialize();
  // when initialization is complete, render
  ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
})(); // tslint:disable-line:no-floating-promises
