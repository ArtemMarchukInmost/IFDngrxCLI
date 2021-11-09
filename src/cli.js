import arg from 'arg';
import inquirer from 'inquirer';
import {createReducer} from './main';

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg({
            '--no-effects': Boolean,
            '--no-actions': Boolean,
            '--no-selectors': Boolean,
            '--ne': '--no-effects',
            '--na': '--no-actions',
            '--ns': '--no-selectors',
        },
        {
            argv: rawArgs.slice(2),
        },
    );
    return {
        noEffects: args['--no-effects'] || false,
        noActions: args['--no-actions'] || false,
        noSelectors: args['--no-selectors'] || false,
        reducerName: args._[0],
    }
}

async function promptForMissingOptions(options) {
    const questions = [];
    if (!options.reducerName) {
        questions.push({
            type: 'input',
            name: 'reducerName',
            message: 'Please input reducer name',
        });
    }

    const answers = await inquirer.prompt(questions);

    return {
        ...options,
        reducerName: options.reducerName || answers.reducerName,
    };
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);

    await createReducer(options);
}
