//go:build darwin

package main

/*
#cgo darwin LDFLAGS: -framework Cocoa
void installLGcodeSystemQuitHook(void);
*/
import "C"

import "sync"

var installSystemQuitHookOnce sync.Once

func installSystemQuitHook() {
	installSystemQuitHookOnce.Do(func() {
		C.installLGcodeSystemQuitHook()
	})
}

//export LGcodeMarkSystemQuit
func LGcodeMarkSystemQuit() {
	markSystemQuitRequested()
}
