/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import {
  IModelWriteRpcInterface,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
  RpcInterfaceDefinition,
  SnapshotIModelRpcInterface,
  Editor3dRpcInterface,
} from "@bentley/imodeljs-common";
import { PresentationRpcInterface } from "@bentley/presentation-common";

/**
 * Returns a list of RPCs supported by this application
 */
export function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    IModelReadRpcInterface,
    IModelTileRpcInterface,
    PresentationRpcInterface,
    SnapshotIModelRpcInterface,
    IModelWriteRpcInterface,
    Editor3dRpcInterface,
  ];
}
