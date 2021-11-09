import chalk from 'chalk';
import fs from 'fs';

const templateDir = __dirname + '/../templates';

function createDirectory(options) {
    if (!fs.existsSync(options.targetDirectory)){
        fs.mkdirSync(options.targetDirectory, {mode: 0o777});
        fs.chmodSync(options.targetDirectory, 0o777)
    }
}

function parseContent(content, reducerLowerCase, reducerUpperCase, reducerName) {
    content = content.replace(/reducer/g, reducerLowerCase);
    content = content.replace(/Reducer/g, reducerUpperCase);
    content = content.replace(/rpath/g, reducerName);
    content = content.replace(/doNotTouch/g, 'reducer');
    content = content.replace(/DoNotTouch/g, 'Reducer');
    return content;
}

function createReducerFile(reducerLowerCase, reducerUpperCase, options) {
    const content = parseContent(fs.readFileSync(`${templateDir}/reducer.ts`).toString(), reducerLowerCase, reducerUpperCase, options.reducerName);
    fs.writeFileSync(`${options.targetDirectory}/${options.reducerName}.reducer.ts`, content, {mode: 0o666});
    fs.chmodSync(`${options.targetDirectory}/${options.reducerName}.reducer.ts`, 0o666);
}

function createActionsFile(reducerLowerCase, reducerUpperCase, options) {
    const content = parseContent(fs.readFileSync(`${templateDir}/actions.ts`).toString(), reducerLowerCase, reducerUpperCase, options.reducerName);
    fs.writeFileSync(`${options.targetDirectory}/${options.reducerName}.actions.ts`, content);
    fs.chmodSync(`${options.targetDirectory}/${options.reducerName}.actions.ts`, 0o666);
}

function createSelectorsFile(reducerLowerCase, reducerUpperCase, options) {
    const content = parseContent(fs.readFileSync(`${templateDir}/selectors.ts`).toString(), reducerLowerCase, reducerUpperCase, options.reducerName);
    fs.writeFileSync(`${options.targetDirectory}/${options.reducerName}.selectors.ts`, content);
    fs.chmodSync(`${options.targetDirectory}/${options.reducerName}.selectors.ts`, 0o666);
}

function createEffectsFile(reducerLowerCase, reducerUpperCase, options) {
    const content = parseContent(fs.readFileSync(`${templateDir}/effects.ts`).toString(), reducerLowerCase, reducerUpperCase, options.reducerName);
    fs.writeFileSync(`${options.targetDirectory}/${options.reducerName}.effects.ts`, content);
    fs.chmodSync(`${options.targetDirectory}/${options.reducerName}.effects.ts`, 0o666);
}

function changeAppStoreFile(reducerLowerCase, reducerUppercase, reducerName) {
    if (!fs.existsSync(`${process.cwd()}/src/app/store/app.store.ts`)) {
        console.log('app.store.ts file not found');
        return;
    }

    let content = fs.readFileSync(`${process.cwd()}/src/app/store/app.store.ts`).toString();
    content = content.split('\n');
    const newContent = [];

    let searchingStateStart = true;
    let searchingStateEnd = false;
    let searchReducerStart = false;
    let searchReducerEnd = false;

    for (let i = 0; i < content.length; i++) {
        const currentLine = content[i].trim();
        const nextLine = content[i + 1];

        if (searchingStateStart && currentLine === 'export interface State {') {
            searchingStateStart = false;
            searchingStateEnd = true;
        }

        if (searchingStateEnd && currentLine === '}') {
            newContent.push(`    [from${reducerUppercase}.${reducerLowerCase}FeatureKey]: from${reducerUppercase}.IState;`);
            searchingStateEnd = false;
            searchReducerStart = true;
        }

        if (searchReducerStart && currentLine === 'export const reducers: ActionReducerMap\<State\> = {') {
            searchReducerStart = false;
            searchReducerEnd = true;
        }

        if (searchReducerEnd && currentLine === '};') {
            newContent.push(`    [from${reducerUppercase}.${reducerLowerCase}FeatureKey]: from${reducerUppercase}.reducer,`);
            searchReducerEnd = false;
        }

        newContent.push(content[i]);

        if (currentLine.includes('import') && nextLine !== undefined && !nextLine.includes('import')) {
            newContent.push(`import {from${reducerUppercase}} from \'./${reducerName}/${reducerName}.reducer\';`);
        }
    }

    fs.writeFileSync(`${process.cwd()}/src/app/store/app.store.ts`, newContent.join('\n'));

    console.log('Update app.store.ts', chalk.blue.bold('UPDATE'));
}

function updateAppModule(reducerLowerCase, reducerUppercase, reducerName) {
    if (!fs.existsSync(`${process.cwd()}/src/app/app.module.ts`)) {
        console.log('app.module.ts file not found');
        return;
    }

    let content = fs.readFileSync(`${process.cwd()}/src/app/app.module.ts`).toString();
    content = content.split('\n');
    const newContent = [];

    let searchEffectsStart = true;
    let searchEffectsEnd = false;
    let searchImport = true

    for (let i = 0; i < content.length; i++) {
        const currentLine = content[i].trim();
        const nextLine = content[i + 1];

        if (searchEffectsStart && currentLine === 'export const EFFECTS = [') {
            searchEffectsStart = false;
            searchEffectsEnd = true;
        }

        if (searchEffectsEnd && currentLine === '];') {
            newContent.push(`    ${reducerUppercase}Effects,`);
            searchEffectsEnd = false;
        }

        newContent.push(content[i]);

        if (searchImport && currentLine.includes('import') && nextLine !== undefined && !nextLine.includes('import')) {
            newContent.push(`import {${reducerUppercase}Effects} from './store/${reducerName}/${reducerName}.effects';`);
            searchImport = false;
        }
    }

    fs.writeFileSync(`${process.cwd()}/src/app/app.module.ts`, newContent.join('\n'));

    console.log('Update app.module.ts', chalk.blue.bold('UPDATE'));
}

export async function createReducer(options) {
    if (!fs.existsSync(`${process.cwd()}/src/app/store`)) {
        console.log('This Project not ready for this');
        return;
    }

    options = {
        ...options,
        reducerName: options.reducerName.toLowerCase(),
        targetDirectory: `${process.cwd()}/src/app/store/${options.reducerName}`,
    };

    createDirectory(options);

    let reducerLowerCase = options.reducerName.split('-');
    reducerLowerCase = reducerLowerCase.reduce((previousValue, currentValue, idx) => {
        if (idx === 0) {
            return previousValue + currentValue
        }

        return previousValue + currentValue[0].toUpperCase() + currentValue.substr(1);
    });
    const reducerUpperCase = reducerLowerCase[0].toUpperCase() + reducerLowerCase.substr(1);

    createReducerFile(reducerLowerCase, reducerUpperCase, options);
    console.log('Create Reducer file', chalk.green.bold('CREATE'));

    if (!options.noEffects) {
        createEffectsFile(reducerLowerCase, reducerUpperCase, options);
        console.log('Create Effects file', chalk.green.bold('CREATE'));
    }

    if (!options.noSelectors) {
        createSelectorsFile(reducerLowerCase, reducerUpperCase, options);
        console.log('Create Selectors file', chalk.green.bold('CREATE'));
    }

    if (!options.noActions) {
        createActionsFile(reducerLowerCase, reducerUpperCase, options);
        console.log('Create Actions file', chalk.green.bold('CREATE'));
    }

    changeAppStoreFile(reducerLowerCase, reducerUpperCase, options.reducerName);

    if (!options.noEffects) {
        updateAppModule(reducerLowerCase, reducerUpperCase, options.reducerName);
    }
}
