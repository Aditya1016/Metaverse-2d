import axios from "axios";

const BACKEND_URL = "http://localhost:3000"
const WS_URL= "ws://localhost:3001"

describe("Authentication", () => {
    test('User is able to sign up only once', async () => {
        const username = "kirkat" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        }); 
        expect(response.status).toBe(200);
    
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        }); 
        expect(updatedResponse.status).not.toBe(200);
    });

    test('Signup req fails if username is empty', async () => {
        const username = "";
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,    
            type: "admin",
        }); 
        expect(response.status).not.toBe(200);
    })

    test('Signin succeeds if the username and password is correct', async () => {
        const username = "kirkat" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        }); 

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        }); 

        expect(signinResponse.status).toBe(200);
        expect(signinResponse.data.token).toBeDefined();
    })

    test('Signin fails if the username and password is incorrect', async () => {
        const username = "kirkat" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        }); 

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password: "1234567",
        }); 

        expect(signinResponse.status).toBe(403);
    })
})

describe("User metadata endpoints", () => {
    let token = "";
    let avatarId = ""
    beforeAll(async () => {
        const username = kirkat + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl: "https://via.placeholder.com/150",
            name: "Kirkat",
        },{
            headers: {
                Authorization: `Bearer ${signinResponse.data.token}`
            }
        })

        token = signinResponse.data.token
        avatarId = avatarResponse.data.id
    })

    test("User cant update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId: "123456",   
        },{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).not.toBe(200);
    })

    test("User can update their metadata", () => {
        const response = axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId,
        },{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200);
    })

    test("User is not able to be update their metadata cus of missing header", () => {
        const response = axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId,
        })

        expect(response.status).toBe(403);
    })
})

describe("User avatar endpoints", () => {   
    let token = ""
    let avatarId = ""
    let userId = ""
    beforeAll(async () => {
        const username = kirkat + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        userId = response.data.userId

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl: "https://via.placeholder.com/150",
            name: "Kirkat",
        },{
            headers: {
                Authorization: `Bearer ${signinResponse.data.token}`
            }
        })

        token = signinResponse.data.token
        avatarId = avatarResponse.data.id
    })   
    
    test("Get back avatar info for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test("Available avatars list for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(avatar => avatar.id === avatarId)
        expect(currentAvatar).toBeDefined();
    })
})

describe("Space information endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    beforeAll(async () => {
        const username = kirkat + Math.random();
        const password = "123456";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        adminId = signupResponse.data.userId

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        adminToken = signinResponse.data.token

        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username + "-user", 
            password,
            type: "user",
        });

        userId = userResponse.data.userId

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username + "-user", 
            password,
        });

        userToken = userSigninResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id
        

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            thumbnail: "https://via.placeholder.com/150",
            dimensions: "100x200",
            defaultElements: [{
                elementId: element1Id,
                x: 20,
                y: 20
            },{
                elementId: element1Id,
                x: 18,
                y: 20
            },{
                elementId: element2Id,
                x: 19,
                y: 20
            }
        ]
        },
        {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = map.data.id
    })   
    
    test("User is able to create a space", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
            dimensions: "100x200",
            mapId
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined();
    })

    test("User is able to create a space without mapId(empty space)", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.spaceId).toBeDefined();
    })

    test("User is not able to create a space without dimanesions and dimensions", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400)
        expect(response.spaceId).not.toBeDefined();
    })

    test("User is not able to delete a space that doenst exist", async() => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`,{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400)
    })

    test("User is able to delete a space that does exist", async() => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(deleteResponse.status).toBe(200)
    })

    test("User should not be able to delete a space created by another user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(deleteResponse.status).toBe(403)
    })

    test("Admin has no space initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        expect(response.data.spaces.length).toBe(0)
    })

    test("Admin has no space initially", async () => {
        const createSpaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const filteredSpace = response.data.spaces.find(space => space.id === createSpaceResponse.data.spaceId)
        expect(response.data.spaces.length).toBe(1)
        expext(filteredSpace).toBeDefined()
    })
})

describe("Arena endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    let spaceId;
    beforeAll(async () => {
        const username = kirkat + Math.random();
        const password = "123456";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        adminId = signupResponse.data.userId

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        adminToken = signinResponse.data.token

        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username + "-user", 
            password,
            type: "user",
        });

        userId = userResponse.data.userId

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username + "-user", 
            password,
        });

        userToken = userSigninResponse.data.token

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id
        

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            thumbnail: "https://via.placeholder.com/150",
            dimensions: "100x200",
            defaultElements: [{
                elementId: element1Id,
                x: 20,
                y: 20
            },{
                elementId: element1Id,
                x: 18,
                y: 20
            },{
                elementId: element2Id,
                x: 19,
                y: 20
            }
        ]
        },
        {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = map.data.id

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
            dimensions: "100x200",
            mapId
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        spaceId = space.data.spaceId
    })   
    
    test("Incorrect spaceId returns a 400", async() => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`,
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400)
    })

    test("Correct spaceId returns all the elements", async() => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(200)
        expect(response.dimensions).toBe("100x200")
    })

    test("Delete endpoint is able to delete an element", async() => {   
        const element = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        )

        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
            spaceId,
            elementId: element.data.elements[0].id,
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        )

        expect(response.status).toBe(200)
        expect(newResponse.data.elements.length).toBe(2)
    })

    test('Adding an element works as expected', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            spaceId,
            elementId: element1Id,
            x: 20,
            y: 20
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            }
        )

        expect(response.status).toBe(200)
        expect(newResponse.data.elements.length).toBe(3)
    })

    test('Adding an element fails if the elements lies outside boundary condition', async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
            spaceId,
            elementId: element1Id,
            x: 200000,
            y: 2000000
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        expect(response.status).toBe(400)
    })
})

describe("Admin endpoints", () => {
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    beforeAll(async () => {
        const username = kirkat + Math.random();
        const password = "123456";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        adminId = signupResponse.data.userId

        const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        adminToken = signinResponse.data.token

        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username + "-user", 
            password,
            type: "user",
        });

        userId = userResponse.data.userId

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username + "-user", 
            password,
        });

        userToken = userSigninResponse.data.token
    })   

    test("User is not able to hit admin endpoints", async() => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            thumbnail: "https://via.placeholder.com/150",
            dimensions: "100x200",
            defaultElements: []
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        const updateElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`,{
            imageUrl: "https://via.placeholder.com/150",
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        
        expect(elementResponse.status).toBe(403)
        expect(mapResponse.status).toBe(403)
        expect(createAvatarResponse.status).toBe(403)
        expect(updateElementResponse.status).toBe(403)
    })

    test("Admin is able to hit admin endpoints", async() => {   
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            thumbnail: "https://via.placeholder.com/150",
            dimensions: "100x200",
            defaultElements: []
        },
        {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },
        {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        
        expect(elementResponse.status).toBe(200)
        expect(mapResponse.status).toBe(200)
        expect(createAvatarResponse.status).toBe(200)
    })

    test("Admin is able to update the imageUrl", async() => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })
        const response = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,{
            imageUrl: "https://via.placeholder.com/150",
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        expect(response.status).toBe(200)
    })
})

describe("Websocket tests", () => {
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let mapId;
    let element1Id
    let element2Id
    let spaceId
    let ws1Messages = []
    let ws2Messages = []
    let userX;
    let userY;
    let adminX;
    let adminY;
    function waitForAndPopLatest(messageArray){
        return new Promise(r => {
            if(messageArray.length > 0){
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if(messageArray.length > 0){
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP(){
        const username = kirkat + Math.random();
        const password = "123456";
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username, 
            password,
            type: "admin",
        });

        const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username, 
            password,
        });

        adminToken = adminSigninResponse.data.token
        adminId = adminSignupResponse.data.userId

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username: username + "-user", 
            password,
            type: "user",
        });

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username: username + "-user", 
            password,
        });

        userToken = userSigninResponse.data.token
        userId = userSignupResponse.data.userId

        const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            imageUrl: "https://via.placeholder.com/150",
            width: 1,
            height: 1,
            static: true
        },{
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        element1Id = element1Response.data.id
        element2Id = element2Response.data.id
        

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            thumbnail: "https://via.placeholder.com/150",
            dimensions: "100x200",
            defaultElements: [{
                elementId: element1Id,
                x: 20,
                y: 20
            },{
                elementId: element1Id,
                x: 18,
                y: 20
            },{
                elementId: element2Id,
                x: 19,
                y: 20
            }
        ]
        },
        {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        mapId = map.data.id

        const space = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name: "Test",
            dimensions: "100x200",
            mapId
        },
        {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        spaceId = space.data.spaceId
    }

    async function setupWs(){
        ws1 = new WebSocket(WS_URL)

        await new Promise(r => {
            ws1.onopen = r
        })

        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }

        ws2 = new WebSocket(WS_URL)

        await new Promise(r => {
            ws2.onopen = r
        })    

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }
    }

    beforeAll(async () => {
        setupHTTP()
        setupWs()
    })

    test("Get back ack for joining the space", async () => {
        ws1.send(JSON.stringify({
            type: "join",
            payload:{
                spaceId,
                token: adminToken
            }
        }))
        const message1 = await waitForAndPopLatest(ws1Messages)

        ws1.send(JSON.stringify({
            type: "join",
            payload:{
                spaceId,
                token: userToken
            }
        }))
        const message2 = await waitForAndPopLatest(ws1Messages)
        const message3 = await waitForAndPopLatest(ws1Messages)

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")
        
        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)

        expect(message3.type).toBe("user-joined")
        expect(message3.payload.x).toBe(message2.payload.spawn.x)
        expect(message3.payload.x).toBe(message2.payload.spawn.y)
        expect(message3.payload.userId).toBe(userId)

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })

    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: 200000,
                y: 200000
            }
        }))

        const message = await waitForAndPopLatest(ws1Messages)

        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("User should not be able to move two bloacks at same time", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }))

        const message = await waitForAndPopLatest(ws1Messages)

        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("Correct movement should be broadcasted to the other sockets in the room", async () => {
        ws1.send(JSON.stringify({
            type: "movement",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }))

        const message = await waitForAndPopLatest(ws2Messages)

        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close()
        const message = await waitForAndPopLatest(ws2Messages)

        expect(message.type).toBe("user-left")
        expect(message.payload.userId).toBe(adminId)
    })
})