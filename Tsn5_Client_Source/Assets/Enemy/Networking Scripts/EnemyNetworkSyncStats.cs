using UnityEngine;
using System.Collections;

public class EnemyNetworkSyncStats : MonoBehaviour {

	// Use this for initialization
	void Start () {
	
	}
	
	public int enemyHealth;
	
	public void SyncStats(int health)
	{
		enemyHealth = health;
		//currentAnimation = (AniStates)Enum.Parse(typeof(AniStates), animationValue);
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
	void OnSerializeNetworkView(BitStream stream, NetworkMessageInfo info){
		if (stream.isWriting)
		{
			int hp = (int) enemyHealth;
			stream.Serialize(ref hp);
			//char ani = (char)currentAnimation;
			//stream.Serialize(ref ani);
		}
		else
		{
			int hp = (int) 0;
			stream.Serialize(ref hp);
			enemyHealth = (int)hp;
			//char ani = (char)0;
			//stream.Serialize(ref ani);
			
			//currentAnimation = (AniStates)ani;
		}	
	}
}
