function OnNetworkInstantiate (msg : NetworkMessageInfo) {	
	// This is our own player
	if (networkView.isMine)
	{
		//Camera.main.SendMessage("SetTarget", transform);
		GetComponent("NetworkInterpolatedTransform").enabled = false;
		GetComponent(AudioListener).enabled = true;

	}
	// This is just some remote controlled player
	else
	{
		name += "Remote";
		GetComponent(ThirdPersonController).enabled = false;
		GetComponent(ThirdPersonSimpleAnimation).enabled = false;
		GetComponent("NetworkInterpolatedTransform").enabled = true;
		GetComponent(PlayerCombat).enabled = false;
	}
	
	GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).colorMoles();
	//GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).setPlayerID();
}
