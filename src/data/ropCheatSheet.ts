import { RoPItem } from '../types';

export const ROP_DATABASE: RoPItem[] = [
  {
    id: 'point-personal-privilege',
    title: 'Point of Personal Privilege',
    category: 'point',
    interruptSpeaker: true,
    secondRequired: false,
    voteRequired: 'None (Ruled by Chair)',
    debatable: 'No',
    explanation: 'Raised when a delegate experiences physical discomfort or impediment that hinders participation (e.g., room is too hot/cold, cannot hear the speaker, microphone volume is too low). Only interrupts a speaker if the delegate cannot hear.',
    samplePhrasing: '"Point of Personal Privilege: Delegate cannot hear the distinguished delegate speaking."',
    chairResponse: '"Recognized. Speaker, please project your voice towards the microphone."'
  },
  {
    id: 'point-order',
    title: 'Point of Order',
    category: 'point',
    interruptSpeaker: false,
    secondRequired: false,
    voteRequired: 'None (Ruled by Chair)',
    debatable: 'No',
    explanation: 'Raised when the rules of procedure are being violated by a delegate or by the dais/chair (e.g., incorrect speaker time, voting procedure skipped, speaker discussing off-topic matters). Must be raised immediately after the violation occurs.',
    samplePhrasing: '"Point of Order: The delegate of France exceeded their allocated 60 seconds without yielding time."',
    chairResponse: '"Point is well taken. The dais will ensure strict adherence to speech limits."'
  },
  {
    id: 'point-parliamentary-inquiry',
    title: 'Point of Parliamentary Inquiry',
    category: 'point',
    interruptSpeaker: false,
    secondRequired: false,
    voteRequired: 'None (Ruled by Chair)',
    debatable: 'No',
    explanation: 'Used to ask the Chair a question regarding the Rules of Procedure, committee schedule, or current parliamentary status (e.g., "What is the current speaker time?", "When is the deadline for draft resolutions?").',
    samplePhrasing: '"Point of Parliamentary Inquiry: Could the honorable Chair clarify the required majority to close debate?"',
    chairResponse: '"Debate closure requires a two-thirds majority of members present and voting."'
  },
  {
    id: 'point-information',
    title: 'Point of Information (POI)',
    category: 'point',
    interruptSpeaker: false,
    secondRequired: false,
    voteRequired: 'None (Speaker must consent)',
    debatable: 'No',
    explanation: 'A substantive question directed to a speaker who has just completed their speech, provided the speaker yields their remaining time to points of information. In THIMUN rules, POIs are common; in UNA-USA rules, yielding to questions is at the speaker\'s discretion.',
    samplePhrasing: '"Will the honorable delegate of Germany yield to a point of information regarding paragraph 4 of their proposal?"',
    chairResponse: '"Delegate, do you accept the question? [If yes] The delegate may state their question."'
  },
  {
    id: 'motion-mod-caucus',
    title: 'Motion for a Moderated Caucus',
    category: 'caucus',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Simple Majority (50% + 1)',
    debatable: 'No',
    explanation: 'Suspends the General Speakers List to facilitate structured, timed debate on a specific sub-issue. Requires specifying: Total Time, Individual Speaker Time, and the Topic/Sub-issue. Total time must be evenly divisible by speaker time.',
    samplePhrasing: '"The delegate of Pakistan motions for a moderated caucus with a total time of 10 minutes, an individual speaking time of 45 seconds, on the topic of border biosecurity protocols."',
    chairResponse: '"That motion is in order. Are there any seconds? All those in favor please raise your placards."'
  },
  {
    id: 'motion-unmod-caucus',
    title: 'Motion for an Unmoderated Caucus',
    category: 'caucus',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Simple Majority (50% + 1)',
    debatable: 'No',
    explanation: 'Suspends formal parliamentary rules to allow delegates to leave their seats, form working blocs, negotiate directly, and draft working papers/resolutions. Requires specifying total time (e.g., 15 or 20 minutes).',
    samplePhrasing: '"The delegate of Brazil motions for an unmoderated caucus for a duration of 15 minutes to consolidate working papers into draft resolutions."',
    chairResponse: '"The motion is in order. Are there seconds? Seeing multiple, we move directly to a vote."'
  },
  {
    id: 'motion-introduce-resolution',
    title: 'Motion to Introduce Draft Resolution',
    category: 'motion',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Procedural (No vote or Simple Majority depending on RoP)',
    debatable: 'No',
    explanation: 'Once a working paper has been approved by the Dais and formatted with sponsors and signatories, a sponsor motions to officially introduce it to the committee floor for formal reading and debate.',
    samplePhrasing: '"The delegate of South Africa motions to introduce Draft Resolution 1.2 on behalf of the sponsor bloc."',
    chairResponse: '"The motion is recognized. Will the sponsors please send two delegates to the podium to read the operative clauses."'
  },
  {
    id: 'motion-close-debate',
    title: 'Motion to Close Debate',
    category: 'motion',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Two-Thirds Majority (2/3)',
    debatable: 'Yes (2 against closure)',
    explanation: 'Ends all formal and informal debate on the current agenda item and immediately moves the entire committee into formal voting procedure on all introduced draft resolutions.',
    samplePhrasing: '"The delegate of Japan motions to close debate on the current topic and move directly into voting procedure."',
    chairResponse: '"A motion to close debate has been made. This requires a two-thirds majority. Is there any delegate wishing to speak against closing debate?"'
  },
  {
    id: 'motion-roll-call',
    title: 'Motion for a Roll Call Vote',
    category: 'voting',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Usually automatically granted upon request of one or more delegations',
    debatable: 'No',
    explanation: 'Requires every member state in alphabetical order to verbally state their vote ("Yes", "No", "Abstain", or "Yes with Rights" / "No with Rights"). If a delegate answers "Pass", they must vote Yes or No on the second call.',
    samplePhrasing: '"The delegate of Ukraine requests a Roll Call Vote on Draft Resolution 1.1."',
    chairResponse: '"A roll call vote has been requested. The Dais will now call the roll. Delegates who registered \'Present and Voting\' may not abstain."'
  },
  {
    id: 'motion-division-question',
    title: 'Motion for Division of the Question',
    category: 'voting',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Simple Majority (50% + 1)',
    debatable: 'Yes (2 in favor, 2 against)',
    explanation: 'Proposes to vote on specific clauses or sections of a draft resolution separately from the rest of the text. If passed, controversial clauses are voted on individually; those that pass re-enter the resolution, those that fail are stricken.',
    samplePhrasing: '"The delegate of Canada motions for a division of the question to vote on Operative Clauses 4 and 7 separately."',
    chairResponse: '"That is in order. We will hear two speakers in favor and two speakers against dividing the question."'
  },
  {
    id: 'motion-adjourn',
    title: 'Motion to Adjourn / Suspend the Meeting',
    category: 'general',
    interruptSpeaker: false,
    secondRequired: true,
    voteRequired: 'Simple Majority',
    debatable: 'No',
    explanation: 'Suspension suspends the meeting until a scheduled later session (e.g. lunch break or next morning). Adjournment formally closes the conference committee until next year.',
    samplePhrasing: '"The delegate of Egypt motions to suspend the meeting until 14:00 hours for lunch break."',
    chairResponse: '"The motion to suspend the session is recognized and will be voted upon immediately."'
  },
  {
    id: 'right-of-reply',
    title: 'Right of Reply',
    category: 'general',
    interruptSpeaker: false,
    secondRequired: false,
    voteRequired: 'Ruled by Chair upon written request',
    debatable: 'No',
    explanation: 'Granted when another delegate has directly attacked the national sovereignty, dignity, or head of state of a delegation. Usually submitted in writing to the Dais; if approved, the delegate receives 30-60 seconds to defend their nation without attacking in return.',
    samplePhrasing: '"Delegate of Türkiye submits a Right of Reply to the Chair following defamatory remarks on our territorial integrity."',
    chairResponse: '"The Dais has received the note. The Right of Reply is granted. The delegate of Türkiye has 45 seconds at the podium."'
  }
];
