# :question: Why does this log twice?

## :page_with_curl:  _Instructions_

**1.** Clone repo & submodules:

__`❍ git clone https://github.com/gskapka/func-log.git`__

**2.** Switch into directory:

__`❍ cd func-log`__

**3.** Install dependencies:

__`❍ npm install`__

**4.** Run tests:

__`❍ node why-log-twice`__

&nbsp;

---

&nbsp;

## :collision: The Issue:

__❍__ Expected output: 

```javascript
`Proc 1 log # 1`
`Proc 1 log # 2`
`Proc 1 log # 3`
`Proc 1 log # 4`
`Proc 2 log # 1`
`Proc 2 log # 2`
`Proc 2 log # 3`
`Proc 2 log # 4`
`Proc 1 log # 9`
`Proc 1 log # 10`
`Proc 1 log # 11`
`Proc 1 log # 12`
`Proc 1 log # 13`
`Proc 1 log # 14`
`Proc 1 log # 15`
`All procs have finished!`
```

__❍__ Actual output:

```javascript
`Proc 1 log # 1`                                       
`Proc 1 log # 2`
`Proc 1 log # 3`
`Proc 1 log # 4`
`Proc 2 log # 1`
`Proc 1 log # 6`   // <-- These should not be logged
`Proc 2 log # 2`
`Proc 1 log # 7`
`Proc 2 log # 3`
`Proc 1 log # 8`
`Proc 2 log # 4`
`Proc 1 log # 9`
`Proc 1 log # 10`  // <-- now it's logging twice! :confounded:
`Proc 1 log # 10`
`Proc 2 log # 6`
`Proc 1 log # 11`
`Proc 1 log # 11`
`Proc 2 log # 7`
`Proc 1 log # 12`
`Proc 1 log # 12`
`Proc 2 log # 8`
`Proc 1 log # 13`
`Proc 1 log # 13`
`Proc 2 log # 9`
`Proc 1 log # 14`
`Proc 1 log # 14`
`Proc 2 log # 10`
`All procs have finished!`
```

---

&nbsp;

## :sob: What I'm trying to do.

Obviously to have javascript fire up two child processes and then follow their __`stdout`__'s for a time, logging as they streams, switching between them at will is super easy to do. _Imperatively_. It's also really ugly, & stateful and just urgh. So I'm trying to do it purely, and have built up the computation using the `Task` monad from folktale (the old one, that is), threading through a stateful object by hand like a chump: 

```javascript
//    main _ :: Task error {childProcs}
const main = startProc1({})
  .chain(logUntilProc1IsReady)
  .chain(startProc2)
  .chain(logUntilProc2IsReady)
  .chain(logUntilProc1IsFinished)

```

&nbsp;

Much prettier. It would be much better too, if it worked - help! :dizzy_face:

&nbsp;

Here is the logging function:

&nbsp;

```javascript
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
```

&nbsp;

And here is the `rmAllListeners` function:

&nbsp;


```javascript
//    rmAllListeners :: childProc -> childProc           
const rmAllListeners = proc => (proc.removeAllListeners(), proc.stdout.unref())
```

&nbsp;

Which latter is clearly the issue. Listeners, despite being namespaced and supposedly obliterated by the above, are not being. Why?

&nbsp;


&nbsp;

***

&nbsp;

## :clipboard: _To Do List_

:black_square_button: Make it.

:black_square_button: Make it work.

:white_check_mark: Fail at figuring out why it doesn't work.

:black_square_button: Ask other people to make it work.
