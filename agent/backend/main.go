package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/gofrs/flock"
)

func main() {
	if _, err := os.Stat(filepath.Join(os.TempDir(), "envxsync/envxsyncd.lock")); os.IsNotExist(err) {
		err := os.Mkdir(filepath.Join(os.TempDir(), "envxsync"), os.ModePerm)
		if err != nil {
			log.Fatal(err)
			return
		}
		_, err = os.Create(filepath.Join(os.TempDir(), "envxsync/envxsyncd.lock"))
		if err != nil {
			log.Fatal(err)
			return
		}
	}

	// Allow only single process
	lock := flock.New(filepath.Join(os.TempDir(), "envxsync/envxsyncd.lock"))
	locked, err := lock.TryLock()

	if err != nil {
		log.Fatal(err)
		return
	}
	if locked {
		// No other instances running
		for {
			time.Sleep(1 * time.Second)
		}
	} else {
		// Another instance is running
		fmt.Println("Another instance of envxsyncd is already running.")
		return
	}
}
