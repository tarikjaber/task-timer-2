export interface Task {
    name: string;
    time: number;
    repetitionCount: number;
    index?: number;
}

export function isNumeric(value: string) {
    return /^-?\d+$/.test(value);
}

export function parseTasks(tasksValue: string): Task[] {
    let lines =  (localStorage.getItem('tasks') || '').split('\n').filter(task => task.trim() !== '');
    lines = lines.map(task => task.trim()).map(line => line.replace(/^- \[\s\] /, '').replace(/^- \[\s[xX]\] /, '').replace(/^- /, ''));
    let parsedTasks: Task[] = [];

    parsedTasks = lines.flatMap(task => {
    let parts = task.split(' ');
    let nameParts = parts.slice(0, parts.length - 1);;
    let last = parts[parts.length - 1];
    let numRepeats = 1;
    let time = 10 * 60;
    let rIndex = last.indexOf('r');

    if (rIndex !== -1 && parts.length > 1) {
    let preR = last.slice(0, rIndex);
    let postR = last.slice(rIndex + 1);
    if (!isNaN(Number(preR)) && isNumeric(postR)) {
        time = Number(preR) * 60;
        numRepeats = parseInt(postR);
    }
    } else if (!isNaN(Number(last)) && parts.length > 1){
    time = Number(last) * 60;
    } else {
    nameParts.push(last);
    }

    const taskName = nameParts.join(' ');

    if (numRepeats === 1) {
    return [{
        name: taskName,
        time,
        repetitionCount: numRepeats
    }];
    } else {
    return Array.from({ length: numRepeats }, (_, repeatIndex) => ({
        name: taskName,
        time,
        repetitionCount: numRepeats,
        index: repeatIndex + 1
    }));
        }
    });
    return parsedTasks;
}