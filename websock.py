#!/usr/bin/env python                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                               
# WS server example                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                               
import asyncio                                                                                                                                                                                                                                                 
import websockets                                                                                                                                                                                                                                              
import argparse                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                               
async def hello(websocket, path):                                                                                                                                                                                                                              
        while 42:                                                                                                                                                                                                                                              
            try:                                                                                                                                                                                                                                               
                rx = await websocket.recv()                                                                                                                                                                                                                    
                print(rx)                                                                                                                                                                                                                                      
                await websocket.send(rx)                                                                                                                                                                                                                       
            except:                                                                                                                                                                                                                                            
                break                                                                                                                                                                                                                                          
        print("closed")                                                                                                                                                                                                                                        
parser = argparse.ArgumentParser(description='Websocket echo server')                                                                                                                                                                                          
parser.add_argument('-p', metavar="port", type=int, default=8000, help="port to listen on")                                                                                                                                                                    
args = parser.parse_args()                                                                                                                                                                                                                                     
print("websocket echo listen on port: " + str(args.p))                                                                                                                                                                                                         
start_server = websockets.serve(hello, "localhost", args.p)                                                                                                                                                                                                    
                                                                                                                                                                                                                                                               
asyncio.get_event_loop().run_until_complete(start_server)                                                                                                                                                                                                      
asyncio.get_event_loop().run_forever()                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                               
                                                        