import { IModelQuery } from "@bentley/imodelhub-client";
import { Config } from "@bentley/bentleyjs-core";
import {
  AuthorizedFrontendRequestContext,
  IModelApp,
} from "@bentley/imodeljs-frontend";
import {
  ContextRegistryClient,
  Project,
} from "@bentley/context-registry-client";

export async function getIModelInfo(): Promise<{
  projectId: string;
  imodelId: string;
}> {
  const imodelName = Config.App.get("imjs_test_imodel");
  const projectName = Config.App.get("imjs_test_project", imodelName);

  const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();
  // requestContext.enter();

  const connectClient = new ContextRegistryClient();
  // const ps = await connectClient.getProjects(requestContext);
  // //alert("project个数=" + ps.length.toString());
  // for (const p of ps) {
  //   console.log(p);
  // }
  let project: Project;
  try {
    project = await connectClient.getProject(requestContext, {
      $filter: `Name+eq+'${projectName}'`,
    });
    console.log(project);
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
  if (imodels.length === 0)
    throw new Error(
      `iModel with name "${imodelName}" does not exist in project "${projectName}"`
    );

  return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
}
