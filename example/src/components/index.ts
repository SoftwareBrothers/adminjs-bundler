import AdminJS from 'adminjs';

const BASE = './';
const bundle = (path, componentName) => AdminJS.bundle(`${BASE}/${path}`, componentName);

export const SOME_CUSTOM_COMPONENT = bundle('some-custom-component', 'SomeCustomComponent');
