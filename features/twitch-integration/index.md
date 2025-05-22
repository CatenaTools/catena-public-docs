# Twitch Drops Integration

## Twitch Setup
This guide is written assuming you've never set up anything related to Twitch.
If you have, feel free to skip ahead to relevant sections.

> As you go through these steps, record the following 4 important pieces of information, as you'll need them to configure Catena:
> - The Client Id of your Twitch Application (Step 2)
> - The Client Secret of your Twitch Application (Step 2)
> - Your Organization Id (Step 1)
> - Your Game's Id (Step 1)

1. [Create an Organization](https://dev.twitch.tv/docs/companies/)
   - To create an organization, you are expected to have a game that's already known to Twitch. If you haven't done that, see [Adding a Game or Game Cover Art to Twitch](https://help.twitch.tv/s/article/adding-a-game-and-box-art-to-the-directory?language=en_US).
   - Twitch notes that "Processing typically takes one business week," so you'll want to get this step done a short bit before you want to begin testing, otherwise you may find yourself waiting around.
2. [Create a Twitch Application](https://dev.twitch.tv/docs/drops/#prerequisites-and-setup)
   - For the OAuth Redirect URL, fill it in with the root URL that Catena is running on, plus the following: `/api/v1/authentication/PROVIDER_TWITCH_WEB/callback`
   - The result should look similar to `https://catena.reallycoolgame.example.com:5000/api/v1/authentication/PROVIDER_TWITCH_WEB/callback`
3. [Create a Reward](https://dev.twitch.tv/docs/drops/#create-a-reward)
   1. If you have not yet created an item in Catena that you want to assign as the Twitch Drop, you should do so now.
      - _Dev Q: Do we have a page for this?_
      - TBD: Dashboard doc for this?
   2. Once that item has been created, mark down its Catena Catalog Item Id.
   3. Back in the Twitch reward creation, there is an optional "Reward ID" field. Fill that field in with the Catena Catalog Item Id.
4. [Create a Drops Campaign](https://dev.twitch.tv/docs/drops/#create-a-drops-campaign)
   1. Be sure to check the `Test the Drop` section of the documentation. You'll need at least two accounts:
      1. One of which will be the Creator that will stream the game.
      2. The other of which will be the viewer that will receive the Twitch Drop(s).

## Catena Setup
1. In the `catena-tools-core` project, open `appsettings.json` (or any of its variations).
2. In the `Entitlements` section, if it does not exist, add an `ExternalItemProviders` field. An empty block will look like this:
```json
"ExternalItemProviders": {
  "TwitchDropsProvider": {
    "Database": {
      "ConnectionString": "Data Source=Build/SqliteDatabase/twitch.db;Foreign Keys=True"
    },
    "ClientID": "",
    "Secret": "",
    "GameID": "",
    "OrganizationID":  "",
    "WebHookSecret": "",
    "SkipSignatureVerification": false
  }
}
```
3. Fill in the `Client ID`, `Secret`, `GameID`, and `OrganizationID` fields with the information recorded from the [Twitch Setup](#Twitch-Setup) section.
4. Fill in the `WebHookSecret` with a 10-100 character string of your choosing.
5. Leave the `SkipSignatureVerification` field as `false`.
   - Flipping this field to `true` will activate an emulated Twitch Drop layer meant for testing, and will not connect to Twitch proper.
6. Ensure that the Twitch viewer account that will receive Twitch Drops is connected to a Catena Account.
   - For instructions on how to do the above, please see [Catena Account Linking](this-page-doesn't-exist)
     - _Dev Q: Does this page exist?_

### Testing and Verifying the Catena Pipeline
If you want to ensure that Catena is working as expected, in Step 5 of [Catena Setup](#catena-setup), you can flip the `SkipSignatureVerification` flag to `true`.
Additionally, you will need to include the following field in the `PreferredImplementations` section:
```json
"PreferredImplementations": {
   ...
   "ITwitchDropsWrapper": "EmulTwitchDropsWrapper"
   ...
}
```
After doing the above, and assuming that you have already created a Catena Item as per Step 3.1 of [Twitch Setup](#twitch-setup), you'll need to trigger the fake Twitch Drop from an outside source.
For now, we'll use Postman.
   - Dev Note: Should we offer some kind of http testing section in the dashboard or is that overkill?

#### Postman
Using the address `localhost:5000/twitch/drop/callback` (or your specified `url:port` if appropriate), send a `POST` request with the following body:
```json
{
    "subscription": {
        "id": "test-id",
        "type": "drop.entitlement.grant",
        "version": "1",
        "status": "enabled",
        "condition": {
            "organization_id": "TestOrganization"
        },
        "transport": {
            "method": "webhook",
            "callback": "localhost:5000/twitch/drop/callback"
        },
        "created_at": "2019-11-16T10:11:12.634234626Z"
    },
    "events": [
        {
            "id": "test-event-id-1",
            "data": {
                "organization_id": "TestCatenaOrg",
                "category_id": "TestGameID",
                "category_name": "Very Cool Catena Game",
                "campaign_id": "TestCampaignID",
                "user_id": "<your fake twitch account id here>", // Fill this in
                "user_name": "DisplayName",
                "user_login": "LoginName",
                "entitlement_id": "test-entitlement-id-1",
                "benefit_id": "<your catena item id here>", // Fill this in
                "created_at": "2024-12-01T00:00:00.000Z"
            }
        }
    ]
}
```
After sending the request, move to the next section of the guide to verify that it was received.

## Verifying Drops w/ Catena
We'll assume here that your Twitch Drops campaign is live and you've already had your two accounts (Creator/Streamer and Test Viewer) successfully earn the Drops through Twitch.
What you'll need to do next is ensure that the Drops were successfully obtained by Catena.

### Check the Admin Dashboard
1. Under the `Account Data` tab, input the Catena Account ID that should have received the drop.
2. If the item you set up previously is within the `Owned Items` section, that's a bingo.

### If the above fails...
1. Check the Catena logs.
2. Check the Catena database files, specifically:
   1. Check the `accounts_platforms` table within the `accounts.db` file, and ensure that the Test Viewer account has a Twitch `platform_type` registered.
   2. Check the `twitch_account_mappings` table within the `twitch.db` file, and ensure that the Test Viewer account is linked there.
   3. Check the `twitch_drops` table within the `twitch.db` file, and ensure that the drop (labeled as "entitlement") has been delivered.
      - To confirm, you'll want to find the entry that has the appropriate `twitch_account_id` and `benefit_id`, where the `benefit_id` is the Catena Item Id for the item to be delivered.
      - If the `entitlement_status` is not marked as `FULFILLED`, that confirms a failure somewhere in the pipeline, _after_ having received the drop.