import { promises as fs } from 'fs';
import { join } from 'path';
import AdminJS, { AdminJSOptions } from 'adminjs';

process.env.ADMIN_JS_SKIP_BUNDLE = 'false';
process.env.NODE_ENV = 'production';

const ADMINJS_LOCAL_DIR_PATH = '.adminjs';
const ADMINJS_ASSETS_DIR_PATH = 'node_modules/adminjs/lib/frontend/assets/scripts';
const DESIGN_SYSTEM_DIR_PATH = 'node_modules/@adminjs/design-system';

/**
 * Options for the bundler
 *
 * @memberof module:@adminjs/bundler
 * @alias BundleConfig
 */
export type BundleConfig = {
  /**
   * File path where the bundled files should be moved into. 
   * 
   * The path is relative to where you run the script.
   */
  destinationDir: string;
  /**
   * File path where custom components are bundled. If you have
   * custom components in your project, they must be bundled in one single file.
   * Please look at the example in the repository.
   * 
   * The path is relative to where you run the script.
   */
  customComponentsInitializationFilePath: string;
  /**
   * File path where AdminJS entry files are generated.
   * 
   * This defaults to '.adminjs'.
   * Set this only if you know what you're doing.
   * 
   * The path is relative to where you run the script.
   */
  adminJsLocalDir?: string;
  /**
   * File path where AdminJS standard bundle files are located.
   * 
   * This defaults to 'node_modules/adminjs/lib/frontend/assets/scripts'.
   * Set this only if you know what you're doing.
   * 
   * The path is relative to where you run the script.
   */
  adminJsAssetsDir?: string;
  /**
   * File path where AdminJS design system bundle files are located.
   * 
   * This defaults to 'node_modules/@adminjs/design-system'.
   * Set this only if you know what you're doing.
   * 
   * The path is relative to where you run the script.
   */
  designSystemDir?: string;
  /**
   * You can pass your AdminJS Options config in case you're using external
   * packages with custom components. It's enough to include only `resources` section.
   */
  adminJsOptions?: AdminJSOptions;
};

/**
 * AdminJS file config
 *
 * @memberof module:@adminjs/bundler
 * @alias BundleFile
 */
export type BundleFile = {
  /**
   * A file name.
   */
  name: string;
  /**
   * A source path where the original file can be found.
   */
  sourcePath: string;
  /**
   * A destination path where new bundle file is copied into.
   */
  destinationPath: string;
};

/**
 * Bundles AdminJS javascript browser files. This is an alternative to bundling those files on server startup.
 * The bundled files are stored in "destinationDir". Afterwards, you can for example:
 * 1. Upload those files to a public storage bucket and tell AdminJS to use files from there:
 * ```javascript
 *   const adminJs = new AdminJS({ assetsCDN: <your storage bucket url> })
 * ```
 * 2. Serve the "destinationDir" as a public folder, using i. e. express.static:
 * ```javascript
 *   app.use(express.static(destinationDir));
 *   ...
 *   const adminJs = new AdminJS({ assetsCDN: <your server's url> })
 * ```
 * 
 * IMPORTANT: To prevent AdminJS from attempting to generate a new bundle on server startup,
 * you must set `ADMIN_JS_SKIP_BUNDLE="true"` environment variable!
 * 
 * 
 * @param {BundleConfig} options
 * @memberof module:@adminjs/bundler
 * @method
 * @name bundle
 * @example
 * import { bundle } from '../../src';
 *
 * (async () => {
 *   const files = await bundle({
 *     customComponentsInitializationFilePath: 'src/components/index.ts',
 *     destinationDir: 'src/public',
 *   });
 *
 *   console.log(files);
 *   // do something with built files here
 * })();
 * 
 */
const bundle = async ({
  destinationDir,
  customComponentsInitializationFilePath,
  adminJsLocalDir = ADMINJS_LOCAL_DIR_PATH,
  adminJsAssetsDir = ADMINJS_ASSETS_DIR_PATH,
  designSystemDir = DESIGN_SYSTEM_DIR_PATH,
  adminJsOptions = {}
}: BundleConfig): Promise<BundleFile[]> => {
  await import(join(process.cwd(), customComponentsInitializationFilePath));

  await fs.mkdir(join(process.cwd(), destinationDir), { recursive: true });
  const files = [
    {
      name: 'components.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsLocalDir}/bundle.js`),
      destinationPath: join(process.cwd(), destinationDir, 'components.bundle.js')
    },
    {
      name: 'app.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsAssetsDir}/app-bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, 'app.bundle.js'),
    },
    {
      name: 'global.bundle.js',
      sourcePath: join(process.cwd(), `${adminJsAssetsDir}/global-bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, 'global.bundle.js')
    },
    {
      name: 'design-system.bundle.js',
      sourcePath: join(process.cwd(), `${designSystemDir}/bundle.production.js`),
      destinationPath: join(process.cwd(), destinationDir, 'design-system.bundle.js')
    },
  ];

  const [ customComponentsBundle, ...standardBundles ] = files;

  await Promise.all(standardBundles.map(({ sourcePath, destinationPath }) => fs.copyFile(
    sourcePath,
    destinationPath,
  )));

  await new AdminJS(adminJsOptions).initialize();
  await fs.rename(
    customComponentsBundle.sourcePath,
    customComponentsBundle.destinationPath,
  );

  console.log(`✨ Successfully built AdminJS bundle files! ✨`);

  return files;
};

export default bundle;
