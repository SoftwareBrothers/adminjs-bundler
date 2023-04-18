import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

const BASE = './';

const bundle = (path: string, componentName: string) => componentLoader.add(componentName, `${BASE}/${path}`);

export const SOME_CUSTOM_COMPONENT = bundle('some-custom-component', 'SomeCustomComponent');

export default componentLoader;
