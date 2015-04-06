#!/bin/sh

ssh yjz@ssh.cs.brown.edu "cd /web/cs/web/people/yjz/3d_genome_browser; git pull https://yjzhang@bitbucket.org/yjzhang/3d-genome-viewer.git;chmod -R 755 ./*;"
