import {
  SpatialModelTileTrees,
  TiledGraphicsProvider,
  FeatureOverrideProvider,
  Viewport,
  IModelApp,
  Tool,
  IModelConnection,
  FeatureSymbology,
  SpatialViewState,
  SnapshotConnection,
  TileTreeReference,
  ChangeFlags,
  SpatialModelState,
  TileTree,
} from "@bentley/imodeljs-frontend";
import { BeTimePoint, assert } from "@bentley/bentleyjs-core";
import {
  FeatureAppearance,
  ColorDef,
  RgbColor,
} from "@bentley/imodeljs-common";

interface ChangedElems {
  deleted: Set<string>;
  inserted: Set<string>;
  updated: Set<string>;
}
export class VersionComparisonTool extends Tool {
  public static toolId = "VersionComparisonTool";
  public run(_args: any[]): boolean {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined !== vp) {
      emulateVersionComparison(vp);
    }
    return true;
  }
}
class Trees extends SpatialModelTileTrees {
  private readonly _provider: Provider;

  public constructor(provider: Provider) {
    super(provider.viewport.view as SpatialViewState);
    this._provider = provider;
  }

  protected get _iModel() {
    return this._provider.iModel;
  }

  protected createTileTreeReference(
    model: SpatialModelState
  ): TileTreeReference | undefined {
    // ###TODO: If model contains no deleted elements, ignore
    return new Reference(
      model.createTileTreeReference(this._provider.viewport.view),
      this._provider
    );
  }
}
/** A proxy reference to a TileTreeReference originating from the secondary IModelConnection. */
class Reference extends TileTreeReference {
  private readonly _ref: TileTreeReference;
  private readonly _provider: Provider;

  public constructor(ref: TileTreeReference, provider: Provider) {
    super();
    this._ref = ref;
    this._provider = provider;
  }

  public get castsShadows() {
    return this._ref.castsShadows;
  }

  public get treeOwner() {
    return this._ref.treeOwner;
  }

  protected getSymbologyOverrides(_tree: TileTree) {
    return this._provider.overrides;
  }
}
/** Returns true if version comparison is currently activated for the specified viewport. */
export function isVersionComparisonEnabled(vp: Viewport): boolean {
  return undefined !== vp.findFeatureOverrideProviderOfType<Provider>(Provider);
}
export async function emulateVersionComparison(vp: Viewport): Promise<void> {
  if (isVersionComparisonEnabled(vp)) {
    await disableVersionComparison(vp);
    return;
  }

  await Provider.create(vp);
}
async function getElems(iModel: IModelConnection): Promise<Set<string>> {
  const elems = new Set<string>();
  const ecsql =
    "SELECT ECInstanceId FROM BisCore.SpatialElement WHERE GeometryStream IS NOT NULL";
  for await (const row of iModel.query(ecsql)) elems.add(row.id);

  return elems;
}
/** The most brain-dead, inefficient way of determining which elements exist only in one iModel or the other possible.
 * Any element present in only one or the other iModel is treated as an insertion or deletion.
 * Additionally, selection set is used as the set of updated elements.
 */
async function determineChangedElems(
  iModel: IModelConnection,
  revision: IModelConnection
): Promise<ChangedElems> {
  const inserted = await getElems(iModel);
  const deleted = await getElems(revision);

  for (const elem of deleted) {
    if (inserted.has(elem)) {
      deleted.delete(elem);
      inserted.delete(elem);
    }
  }

  const updated = new Set<string>();
  for (const selected of iModel.selectionSet.elements)
    if (!inserted.has(selected) && !deleted.has(selected))
      updated.add(selected);

  iModel.selectionSet.emptyAll();

  return { inserted, deleted, updated };
}
const changedTransparency = 16; // NB: This will appear more transparent due to use of "fade-out" mode (flat alpha weight).
const unchangedAppearance = FeatureAppearance.fromJSON({
  rgb: RgbColor.fromColorDef(ColorDef.blue),
  transparency: 0.7,
  nonLocatable: true,
});
/** Added to a Viewport to supply graphics from the secondary IModelConnection. */
class Provider implements TiledGraphicsProvider, FeatureOverrideProvider {
  private readonly _trees: SpatialModelTileTrees;
  public readonly iModel: IModelConnection;
  public overrides: FeatureSymbology.Overrides;
  public readonly changedElems: ChangedElems;
  public readonly viewport: Viewport;
  private readonly _removals: Array<() => void> = [];

  public constructor(
    vp: Viewport,
    iModel: IModelConnection,
    elems: ChangedElems
  ) {
    this.iModel = iModel;
    this.changedElems = elems;
    this.viewport = vp;

    this._trees = new Trees(this);
    this.overrides = this.initOverrides();

    this._removals.push(
      vp.onViewportChanged.addListener((_vp, flags) =>
        this.handleViewportChanged(flags)
      )
    );

    vp.addTiledGraphicsProvider(this);
    vp.addFeatureOverrideProvider(this);
    vp.isFadeOutActive = true;
  }

  public dispose(): void {
    for (const removal of this._removals) removal();

    this._removals.length = 0;

    this.viewport.dropFeatureOverrideProvider(this);
    this.viewport.isFadeOutActive = false;
    this.viewport.dropTiledGraphicsProvider(this);

    // closing the iModel will do this - but let's not wait.
    this.iModel.tiles.purge(BeTimePoint.now());

    this.iModel.close(); // eslint-disable-line @typescript-eslint/no-floating-promises
  }

  public static async create(vp: Viewport): Promise<Provider | undefined> {
    try {
      const view = vp.view as SpatialViewState;
      assert(view.isSpatialView());

      // Open the "revision" iModel.
      // const filename = vp.iModel.getRpcProps().key + ".rev";
      const filename = vp.iModel.getRpcProps().key;
      const iModel = await SnapshotConnection.openFile(filename);

      // ###TODO determine which model(s) contain the deleted elements - don't need tiles for any others.
      await iModel.models.load(view.modelSelector.models);

      const changedElems = await determineChangedElems(vp.iModel, iModel);

      return new Provider(vp, iModel, changedElems);
    } catch (err) {
      alert(err.toString());
      return undefined;
    }
  }

  public forEachTileTreeRef(
    _vp: Viewport,
    func: (ref: TileTreeReference) => void
  ): void {
    this._trees.forEach(func);
  }

  /** The overrides applied to the *primary* IModelConnection, to hilite inserted/updated elements. */
  public addFeatureOverrides(
    overrides: FeatureSymbology.Overrides,
    _viewport: Viewport
  ): void {
    overrides.setDefaultOverrides(unchangedAppearance);

    for (const elem of this.changedElems.deleted) overrides.setNeverDrawn(elem);

    const inserted = FeatureAppearance.fromRgba(
      //   ColorDef.from(0, 0xff, 0, changedTransparency)
      ColorDef.red
    );
    for (const elem of this.changedElems.inserted)
      overrides.overrideElement(elem, inserted);

    const updated = FeatureAppearance.fromRgba(
      // ColorDef.from(0, 0x7f, 0xff, changedTransparency)
      ColorDef.blue
    );
    for (const elem of this.changedElems.updated)
      overrides.overrideElement(elem, updated);
  }

  /** The overrides applied to the tiles from the *secondary* IModelConnection, to draw only deleted elements. */
  private initOverrides(): FeatureSymbology.Overrides {
    const ovrs = new FeatureSymbology.Overrides(this.viewport);
    ovrs.neverDrawn.clear();
    ovrs.alwaysDrawn.clear();
    ovrs.setAlwaysDrawnSet(this.changedElems.deleted, true, false); // really "only-drawn" - only draw our deleted elements - unless their subcategory is turned off.

    const red = ColorDef.from(0xff, 0, 0, changedTransparency);
    ovrs.setDefaultOverrides(FeatureAppearance.fromRgba(red));

    return ovrs;
  }

  private handleViewportChanged(flags: ChangeFlags): void {
    if (flags.viewState && !this.viewport.view.isSpatialView()) {
      // Switched to a 2d view. Terminate version comparison.
      this.dispose();
      return;
    }

    if (flags.areFeatureOverridesDirty) {
      this.overrides = this.initOverrides();
      this.viewport.invalidateScene();
    }

    if (flags.viewedModels) {
      this._trees.markDirty();
      this.viewport.invalidateScene();

      const models = (this.viewport.view as SpatialViewState).modelSelector
        .models;
      const unloaded = this.iModel.models.filterLoaded(models);
      if (undefined === unloaded) return;

      this.iModel.models
        .load(unloaded)
        .then(() => {
          this._trees.markDirty();
          this.viewport.invalidateScene();
        })
        .catch((_) => undefined);
    }
  }
}
/** Turn off version comparison if it is enabled. */
export async function disableVersionComparison(vp: Viewport): Promise<void> {
  const existing = vp.findFeatureOverrideProviderOfType<Provider>(Provider);
  if (undefined !== existing) {
    existing.dispose();
    await existing.iModel.close();
  }
}
