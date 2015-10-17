## Tutorial By Steven Criscione and Jack Zhang
Email: [steven_criscione@brown.edu](mailto:steven_criscione@brown.edu)
Email: [yue_zhang@alumni.brown.edu](mailto:steven_criscione@alumni.brown.edu)

## 3DC-Browser: A 3D Chromsoome visualization tool

The companion package for 3D Modelling is [FISH-MDS] (https://github.com/yjzhang/FISH_MDS.jl).

## Installation 
First clone the repository with git:  

    git clone https://github.com/yjzhang/3DC-Browser.git

Open the folder and open the file below:

    3DC-Browser.html
    
This should open the interactive GUI for 3DC-Browser.  The browser was tested using the web browser google chrome.

## Main file format 

The expected 3D coordinate file is the format output from [FISH-MDS] (https://github.com/yjzhang/FISH_MDS.jl).

However, if you would like to use another 3D algorithm to model the chromosome; the structure needs to be in the following format:

The first line states the # of subsequent lines, and the remaining lines contain x,y,z coordinates in space seperated format. Here is an example of the first 5 lines of such a file, that has 598 coordinates:
```
598
-0.288722 -0.257163 -0.223187
-0.355618 -0.279322 -0.184899
-0.182785 -0.243383 -0.186918
-0.370771 -0.289706 -0.257996
```

## Video Tutorial:

Here is a link to a video tutorial of how to use the 3DC-Browser hoston on our lab website:

[Using 3DC-browser] (deadlink)

## Technical Notes:

1.  The browser was meant to be used on most computers.  However, visualization of super high-resolution Hi-C may require a better graphics cards and more memory.  For example, data binned at < 100 kb bin size could produce issues for a laptop, due to the many points displayed.  You can improve performance for super high-resolution chromosome models by lowering the resolution of the browser to low.  
2.  To visualize tracks it is important that inputted information is accurate.  Make sure the resolution matches the binning of the Hi-C experiment (for example 50000 for 50 kb binning).  Also make sure the correct chromosome (e.g. chr4) and arm is selected (1 is the p arm and 2 is the q arm).  Also if bins have been removed from the 3D chromosome model they need to be inputted as comma seperated values.  Removed bins may be obtained from the stdout files produced in FISH-MDS (https://github.com/yjzhang/FISH_MDS.jl) such as (chr4_condition1.stdout) in our example.

## References of javascript libraries used

[three.js](http://threejs.org)

[numeric.js](http://www.numericjs.com)
