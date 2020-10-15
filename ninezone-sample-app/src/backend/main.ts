/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { app as electron } from "electron";
import { Config, Logger, LogLevel } from "@bentley/bentleyjs-core";
import { IModelHost, IModelHostConfiguration } from "@bentley/imodeljs-backend";
import { Presentation } from "@bentley/presentation-backend";
import { RpcConfiguration, RpcInterfaceDefinition } from "@bentley/imodeljs-common";
import { getSupportedRpcs } from "../common/rpcs";
import { AppLoggerCategory } from "../common/LoggerCategory";
import { IModelBankClient } from "@bentley/imodelhub-client";
import { AzureFileHandler ,StorageServiceFileHandler} from "@bentley/backend-itwin-client";
import { parseBasicAccessToken } from "./BasicAuthorization";
import { LocalhostHandler } from "./LocalhostHandler";
// Setup logging immediately to pick up any logging during IModelHost.startup()
Logger.initializeToConsole();
Logger.setLevelDefault(LogLevel.Warning);
Logger.setLevel(AppLoggerCategory.Backend, LogLevel.Info);

function getFileHandlerFromConfig() {
  //const storageType: string = Config.App.get("imjs_imodelbank_storage_type");
    const storageType: string = "localhost";
  switch (storageType) {
    case "azure":
      return new AzureFileHandler();
    case "servicestorage":
      return new StorageServiceFileHandler();
    case "localhost":
    default:
      return new LocalhostHandler();
  }
}

(async () => {
  try {
    // Initialize iModelHost
    const config = new IModelHostConfiguration();

    // iTwinStack: specify what kind of file handler is used by IModelBankClient
    const fileHandler = getFileHandlerFromConfig();

    // iTwinStack: setup IModelBankClient as imodelClient for IModelHost
    // const url = Config.App.get("imjs_imodelbank_url");
    const url ="http://localhost:4000"
    config.imodelClient = new IModelBankClient(url, fileHandler);

    // Initialize iModelHost
    await IModelHost.startup(config);
RpcConfiguration.requestContext.deserialize = parseBasicAccessToken;
    // Initialize Presentation
    Presentation.initialize();

    // Get platform-specific initialization function
    let init: (rpcs: RpcInterfaceDefinition[]) => void;
    if (electron) {
      init = (await import("./electron/main")).default;
    } else {
      init = (await import("./web/BackendServer")).default;
    }

    // Get RPCs supported by this backend
    const rpcs = getSupportedRpcs();

    // Invoke platform-specific initialization
    init(rpcs);
  } catch (error) {
    Logger.logError(AppLoggerCategory.Backend, error);
    process.exitCode = 1;
  }
})(); // tslint:disable-line:no-floating-promises
