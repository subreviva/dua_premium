
Control a character
POST
/v1/character_performance
This endpoint will start a new task to control a character's facial expressions and body movements using a reference video.

Authentication
Authorization
Use the HTTP Authorization header with the Bearer scheme along with an API key.

Headers
X-Runway-Version
Required
string
The version of the RunwayML Partner API being used.

This field must be set to the exact value 2024-11-06.

Request body
model
Required
string
This field must be set to the exact value act_two.

character
Required
any
The character to control. You can either provide a video or an image. A visually recognizable face must be visible and stay within the frame.

One of the following shapes:
CharacterImage
object
An image of your character. In the output, the character will use the reference video performance in its original static environment.

type
Required
string
This field must be set to the exact value image.

uri
Required
string or string
A HTTPS URL or data URI containing an encoded image. See our docs on image inputs for more information.

One of the following shapes:
string
[ 13 .. 5242880 ] characters
^data:image\/.*
A data URI containing an encoded image.

string
<uri>
[ 13 .. 2048 ] characters
A HTTPS URL.

CharacterVideo
object
A video of your character. In the output, the character will use the reference video performance in its original animated environment and some of the character's own movements.

type
Required
string
This field must be set to the exact value video.

uri
Required
string or string
A HTTPS URL or data URI containing an encoded video. See our docs on video inputs for more information.

One of the following shapes:
string
[ 13 .. 16777216 ] characters
^data:video\/.*
A data URI containing an encoded video.

string
<uri>
[ 13 .. 2048 ] characters
A HTTPS URL.

reference
Required
any
The reference video containing the performance to apply to the character.

CharacterReferenceVideo
object
A video of a person performing in the manner that you would like your character to perform. The video must be between 3 and 30 seconds in duration.

type
Required
string
This field must be set to the exact value video.

uri
Required
string or string
A HTTPS URL pointing to a video or a data URI containing a video of a person performing in the manner that you would like your character to perform. The video must be between 3 and 30 seconds in duration. See our docs on video inputs for more information.

One of the following shapes:
string
[ 13 .. 16777216 ] characters
^data:video\/.*
A data URI containing an encoded video.

string
<uri>
[ 13 .. 2048 ] characters
A HTTPS URL.

seed
integer
[ 0 .. 4294967295 ]
If unspecified, a random number is chosen. Varying the seed integer is a way to get different results for the same other request parameters. Using the same seed integer for an identical request will produce similar results.

bodyControl
boolean
A boolean indicating whether to enable body control. When enabled, non-facial movements and gestures will be applied to the character in addition to facial expressions.

expressionIntensity
integer
[ 1 .. 5 ]
Default:
3
An integer between 1 and 5 (inclusive). A larger value increases the intensity of the character's expression.

ratio
string
Accepted values:
"1280:720"
"720:1280"
"960:960"
"1104:832"
"832:1104"
"1584:672"
The resolution of the output video.

contentModeration
object
Settings that affect the behavior of the content moderation system.

publicFigureThreshold
string
Accepted values:
"auto"
"low"
When set to low, the content moderation system will be less strict about preventing generations that include recognizable public figures.

Responses
200
Task created

429
You have exceeded the rate limit for this endpoint.



// npm install --save @runwayml/sdk
import RunwayML from '@runwayml/sdk';

// The env var RUNWAYML_API_SECRET is expected to contain your API key.
const client = new RunwayML();

const task = await client.characterPerformance
  .create({
    model: 'act_two',
    character: {
      type: 'video',
      uri: 'https://example.com/posedCharacter.mp4',
    },
    reference: {
      type: 'video',
      uri: 'https://example.com/actorPerformance.mp4',
    },
    ratio: '1280:720',
  })
  .waitForTaskOutput();
console.log(task);
200

{
"id": "497f6eca-6276-4993-bfeb-53cbbbba6f08"
}



chacter
https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/cp-act-two-character-input.jpeg

reference - https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/cp-act-two-reference-input.mp4



output - https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/upscale-input.mp4


