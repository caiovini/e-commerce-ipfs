pragma solidity ^0.4.17;

contract Agora{
    
    struct User{
        
        string userName;
        string password;
        string publicKey;
        string privateKey;
        address userAddress;
        bool isUserActive;
    }
    
    mapping( string => User ) users;

    function registerNewUser( string memory signature  ,
                              string memory userName   ,
                              string memory password   , 
                              string memory publicKey  , 
                              string memory privateKey ) public {
        
        require(!users[signature].isUserActive);
        require(bytes(signature).length > 0);
        require(bytes(userName).length > 0);
        require(bytes(password).length > 0);
        require(bytes(publicKey).length > 0);
        require(bytes(privateKey).length > 0);
        
        User memory user = User({
            userName: userName,
            password: password,
            publicKey: publicKey,
            privateKey: privateKey,
            userAddress: msg.sender,
            isUserActive: true
        });

        users[signature] = user;
    }
    
    function requireAccess(string memory signature ,
                           string memory password)
                           public view returns( string , string ){
        
        User memory user = users[signature];
        if(user.isUserActive){
            if( keccak256(user.password) == keccak256(password) ){

                return ( user.userName , user.privateKey );
            }
        }
    }

    function getPubKey(string memory signature) public view returns( string ){

        return users[signature].publicKey;
    }
    
    function getWalletAddress(string memory signature) public view returns( address ){

        return users[signature].userAddress;
    }
    
    function checkIfUserExists(string memory signature ) public view returns( bool ){
        
        return users[signature].isUserActive;
    }
}