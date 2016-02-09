#!/usr/bin/env python

import sys
import os
import errno
import shutil

def get_line_number(phrase, file_name):
    with open(file_name) as f:
        for i, line in enumerate(f, 1):
            if phrase in line:
                return i

def editletterIndex(filename):
    with open(filename, 'r') as file:
        data = file.readlines()

    lineNum = get_line_number("color: #ff2800 !important", filename)

    data[lineNum - 1] = '  color: #7CAAED !important;\n'

    # and write everything back
    with open(filename, 'w') as file:
        file.writelines( data )

def readFile():
    for arg in sys.argv:        
        if(arg != sys.argv[0]):
            make_sure_path_exists('../proliferation/J03G/controls/List2/css/')
            shutil.copy2('./controls/List2/css/'+arg, '../proliferation/J03G/controls/List2/css/'+arg)
            FiletoBeProcessed = '../proliferation/J03G/controls/List2/css/'+arg
            print 'Processing...',FiletoBeProcessed
            editletterIndex(FiletoBeProcessed)

def make_sure_path_exists(path):
    try:
        os.makedirs(path)
    except OSError as exception:
        print 'The Folder Exists'
        if exception.errno != errno.EEXIST:
            raise

def specificforList():
    make_sure_path_exists('../proliferation/J03G/controls/List2/css/')
    shutil.copy2('./controls/List2/css/List2Ctrl.css', '../proliferation/J03G/controls/List2/css/List2Ctrl.css')
    shutil.copy2('./controls/List2/css/List2Ctrl_rtl.css', '../proliferation/J03G/controls/List2/css/List2Ctrl_rtl.css')
    FiletoBeProcessed = '../proliferation/J03G/controls/List2/css/List2Ctrl.css'
    print 'Processing...',FiletoBeProcessed
    editletterIndex(FiletoBeProcessed)
    FiletoBeProcessed = '../proliferation/J03G/controls/List2/css/List2Ctrl_rtl.css'
    print 'Processing...',FiletoBeProcessed
    editletterIndex(FiletoBeProcessed)

specificforList()
