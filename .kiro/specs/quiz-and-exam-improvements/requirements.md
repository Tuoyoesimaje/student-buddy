# Requirements Document

## Introduction

This specification addresses improvements to two core learning features in the Student Buddy application: the Quiz System and the Practice Exam System. The Quiz System needs enhanced timing controls, better navigation, and clearer user feedback during the learning process. The Practice Exam System requires restructured AI feedback to separate performance assessment from actionable improvement guidance.

## Glossary

- **Quiz System**: The interactive multiple-choice quiz feature where students answer questions with hints and explanations, accessed via the Study page
- **Practice Exam System**: The open-ended exam feature where students write detailed answers that are graded by AI
- **Timer**: The countdown clock displayed during quiz sessions
- **Auto-advance**: The automatic progression to the next question after a student answers
- **Hint**: A subtle clue provided to help students recall information without revealing the answer
- **Explanation**: A detailed description of why an answer is correct, shown after attempts
- **Second Attempt**: The retry opportunity given after an incorrect first answer
- **Previous Button**: Navigation control allowing students to review already-answered questions
- **AI Feedback**: The automated grading response provided after practice exam submission
- **Performance Feedback**: What the student got right and wrong in their exam answers
- **Improvement Guidance**: Specific next steps and recommendations for learning improvement
- **Read-only Mode**: A state where questions are displayed for review without allowing new answers

## Requirements

### Requirement 1: Quiz Timer Duration

**User Story:** As a student taking a quiz, I want more time to complete all questions, so that I can thoughtfully answer without feeling rushed.

#### Acceptance Criteria

1. WHEN a quiz session starts THEN the system SHALL initialize the timer to 12 minutes (720 seconds)
2. WHEN the timer is displayed THEN the system SHALL show the time in MM:SS format
3. WHEN the timer reaches zero THEN the system SHALL auto-submit the quiz with current answers
4. WHEN a student resets the quiz THEN the system SHALL restore the timer to 12 minutes

### Requirement 2: Post-Answer Delay Timing

**User Story:** As a student who just answered a question, I want appropriate time to process feedback, so that I can learn from explanations before moving to the next question.

#### Acceptance Criteria

1. WHEN a student answers correctly on the first attempt THEN the system SHALL wait 5 seconds before auto-advancing to the next question
2. WHEN a student answers incorrectly and views the hint THEN the system SHALL wait 20 seconds before auto-advancing to the next question
3. WHEN a student completes their second attempt THEN the system SHALL wait 20 seconds before auto-advancing to the next question
4. WHEN the explanation is displayed THEN the system SHALL ensure the 20-second delay allows reading time
5. WHEN the delay timer is active THEN the system SHALL prevent manual navigation until the delay completes

### Requirement 3: Previous Question Navigation

**User Story:** As a student reviewing my quiz, I want to go back and see previous questions, so that I can review what I learned without time pressure.

#### Acceptance Criteria

1. WHEN a student is viewing any question except the first THEN the system SHALL display a "Previous" button
2. WHEN a student clicks the "Previous" button THEN the system SHALL navigate to the immediately preceding question
3. WHEN viewing a previous question THEN the system SHALL display the question in read-only mode
4. WHEN in read-only mode THEN the system SHALL show the question, all options, the student's answer, the hint, and the explanation
5. WHEN in read-only mode THEN the system SHALL NOT display any countdown timer
6. WHEN in read-only mode THEN the system SHALL NOT allow the student to change their answer
7. WHEN viewing a previous question THEN the system SHALL display a "Next" button to return to forward navigation
8. WHEN a student clicks "Next" from a previous question THEN the system SHALL navigate forward through the quiz

### Requirement 4: Second Attempt Indicator

**User Story:** As a student who answered incorrectly, I want a clear indicator that I should try again, so that I understand the system is giving me another chance.

#### Acceptance Criteria

1. WHEN a student submits an incorrect first answer THEN the system SHALL display a "Try Again" or "Second Try" indicator
2. WHEN the hint is displayed after a wrong answer THEN the system SHALL show the retry indicator near the hint
3. WHEN the retry indicator is shown THEN the system SHALL use clear, encouraging language
4. WHEN a student is on their second attempt THEN the system SHALL maintain the indicator until they submit their answer
5. WHEN a student submits their second attempt THEN the system SHALL remove the retry indicator

### Requirement 5: Practice Exam Feedback Separation

**User Story:** As a student reviewing my practice exam results, I want performance feedback and improvement guidance clearly separated, so that I can easily understand what I did and what to do next.

#### Acceptance Criteria

1. WHEN the AI grades a practice exam THEN the system SHALL generate two distinct feedback sections
2. WHEN displaying exam results THEN the system SHALL show performance feedback in one dedicated section
3. WHEN displaying exam results THEN the system SHALL show improvement guidance in a separate dedicated section
4. WHEN generating performance feedback THEN the AI SHALL detail what the student got right and what they got wrong
5. WHEN generating improvement guidance THEN the AI SHALL provide specific, actionable next steps for learning
6. WHEN generating improvement guidance THEN the AI SHALL recommend specific topics or concepts to review
7. WHEN generating improvement guidance THEN the AI SHALL prioritize foundational concepts before advanced topics
8. WHEN generating improvement guidance THEN the AI SHALL reference specific areas from the student's answers
9. WHEN displaying feedback sections THEN the system SHALL use clear visual separation (distinct cards or containers)
10. WHEN a student reads the feedback THEN the system SHALL allow independent scrolling or navigation between sections

### Requirement 6: Enhanced AI Feedback Prompt

**User Story:** As a student receiving AI feedback, I want detailed and structured guidance, so that I know exactly how to improve my understanding.

#### Acceptance Criteria

1. WHEN the AI generates feedback THEN the system SHALL use an enhanced prompt that requests separated feedback sections
2. WHEN the AI generates performance feedback THEN the system SHALL include specific examples from the student's answers
3. WHEN the AI generates improvement guidance THEN the system SHALL provide a prioritized learning path
4. WHEN the AI generates improvement guidance THEN the system SHALL explain why certain topics should be reviewed first
5. WHEN the AI generates improvement guidance THEN the system SHALL connect recommendations to specific weaknesses identified in the performance feedback
6. WHEN the AI response is received THEN the system SHALL parse and separate the two feedback sections correctly
7. WHEN parsing fails THEN the system SHALL display the complete feedback with a clear indication that manual separation may be needed

### Requirement 7: Quiz State Management

**User Story:** As a student navigating through quiz questions, I want the system to maintain my progress accurately, so that I don't lose my answers or position.

#### Acceptance Criteria

1. WHEN a student navigates to a previous question THEN the system SHALL preserve all answer states for all questions
2. WHEN a student navigates forward from a previous question THEN the system SHALL restore the current question state
3. WHEN auto-advance occurs THEN the system SHALL save the current answer before advancing
4. WHEN the quiz timer expires THEN the system SHALL save all current answers before submission
5. WHEN a student manually navigates THEN the system SHALL cancel any pending auto-advance timers

### Requirement 8: Visual Feedback Improvements

**User Story:** As a student using the quiz system, I want clear visual indicators of my progress and status, so that I always know where I am in the quiz.

#### Acceptance Criteria

1. WHEN viewing any question THEN the system SHALL display the current question number and total questions
2. WHEN in read-only mode THEN the system SHALL display a visual indicator that the question has been answered
3. WHEN the retry indicator is shown THEN the system SHALL use a distinct color or icon to draw attention
4. WHEN auto-advance is pending THEN the system SHALL optionally display a countdown or progress indicator
5. WHEN displaying the "Previous" button THEN the system SHALL use consistent styling with other navigation controls
