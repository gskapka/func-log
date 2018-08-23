const PROC_ONE_NAME = `proc1`
const PROC_TWO_NAME = `proc2`
const Task = require('data.task')
const {exec} = require('child_process')
const {tryCatch, curry} = require('ramda')
const PROC_ONE_PATH = `node child-proc "Proc 1 log # "`
const PROC_TWO_PATH = `node child-proc "Proc 2 log # "`

//    rmAllListeners :: childProc -> childProc           
const rmAllListeners = proc => (proc.removeAllListeners(), proc.stdout.unref())

//    procIsReady :: string -> bool
const procIsReady = str => str.includes('5')

//    procIsFinished :: string -> bool
const procIsFinished = str => str.includes('15')

//    execProc :: string -> string -> {} -> Task error {childProc}
const execProc = curry((procName, procPath, procObj) => 
  new Task((rej,res) => 
    tryCatch(_ => (procObj[procName] = exec(procPath), res(procObj)),
             _ => rej(`Couldn't execute ${procName} process!`))()))

//    startProc1 :: {} -> Task error {childProc}
const startProc1 = execProc(PROC_ONE_NAME, PROC_ONE_PATH)

//    startProc1 :: {} -> Task error {childProc}
const startProc2 = execProc(PROC_TWO_NAME, PROC_TWO_PATH)

//    logStreamUntil :: int -> (a -> bool) -> proc -> string -> Task error State () {childProcs}
const logStreamUntil = curry((predFunc, procName, procObj) => 
  new Task ((_, res) => {
    const proc = procObj[procName]
    const logUntilPred = data =>
      predFunc(data) 
        ? (rmAllListeners(proc), res(procObj))
        : console.log(data)
    proc.stdout.on('data', logUntilPred)
}))

//    logUntilProc1IsReady :: {childProcs} -> Task error {childProcs}
const logUntilProc1IsReady = logStreamUntil(procIsReady, PROC_ONE_NAME)

//    logUntilProc2IsReady :: {childProcs} -> Task error {childProcs}
const logUntilProc2IsReady = logStreamUntil(procIsReady, PROC_TWO_NAME)

//    logUntilProc1IsFinished :: {childProcs} -> Task error {childProcs}
const logUntilProc1IsFinished = logStreamUntil(procIsFinished, PROC_ONE_NAME)

//    main _ :: Task error {childProcs}
const main = startProc1({})
  .chain(logUntilProc1IsReady)
  .chain(startProc2)
  .chain(logUntilProc2IsReady)
  .chain(logUntilProc1IsFinished)

main.fork(e => console.log('Error: ', e),
          r => {
            r[PROC_ONE_NAME].kill()
            r[PROC_TWO_NAME].kill()
            console.log(`All procs have finished!`)
            process.exit(0)})