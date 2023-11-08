package main

import (
	"fmt"
	"time"
	"github.com/actions4gh/toolkit.go/core"
	"github.com/actions4gh/toolkit.go/github"
)

func main() {
	fmt.Printf("Hello %s!\n", core.GetInput("name", nil))
	core.SetOutput("time", time.Now().Format("3:04 PM"))
}
