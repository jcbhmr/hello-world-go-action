package main

import (
	"fmt"
	"time"

	"github.com/fatih/color"
)

func main() {
	color.Set(color.FgRed)
	defer color.Unset()
	fmt.Printf("Hello %s!\n", "world")
	color.Set(color.FgBlue)
	fmt.Printf("%s=%s\n", "time", time.Now().Format("3:04 PM"))
}
