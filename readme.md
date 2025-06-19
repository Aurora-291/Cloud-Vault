# Cloud Vault

cloudvault is a web app i made to help me manage my stuff online. you can make an account and then you get a cool dashboard where you can drag and drop files to upload them and you can also save little text snippets or links to a cloud clipboard. it also has a dark mode becuase everything should have a dark mode.

* you make an account and get a dashboard
* you can drag files to upload them or just click
* theres a clipboard section too for saving text and links

## Why i made this

using storage bucket in web serice will cost you but storing data in db doesnt so i made a site which can encode and decode files into base64 code
and store base64 code in db so that your data is secure and cost free 

## How i made it

Front end : Html, Css, Js

Back end : firebase

## Struggles and What i have learned

* i kept trying to upload the whole file at once and it just kept failing i didnt know why
* turns out the database i used (firestore) cant handle more than 1mb at a time so i had to learn how to split files into chunks
* my first few tries at downloading gave me corrupted files which was so frustrating
* i learned a ton about async javascript like how to make the code wait for one chunk to finish before starting teh next one
* also i totally meant to add keyboard shortcuts but i forgot to write the actual function for it you can see the empty call in the code lmao whoops.
* i learned about base64 file system

## Usage of AI
* used ai to solve my errors which are not known how to solve by me
* used ai for formating the code like alignment and arrangement
* used ai in few parts of readme file when i dont know to convey what im trying to convey
