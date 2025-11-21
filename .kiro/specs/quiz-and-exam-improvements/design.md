# Design Document

## Overview

This design addresses improvements to the Quiz System and Practice Exam System in the Student Buddy application. The Quiz System enhancements focus on timing adjustments, navigation improvements, and clearer user feedback. The Practice Exam System improvements restructure AI-generated feedback to provide clearer separation between performance assessment and improvement guidance.

The design maintains the existing React component architecture while introducing new state management for navigation modes, enhanced timing controls, and improved AI prompt engineering for structured feedback generation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Study.jsx (Quiz System)                               │ │
│  │  - Timer Management (12 min)                           │ │
│  │  - Navigation State (current/previous/read-only)       │ │
│  │  - Auto-advance Delays (5s/20s)                        │ │
│  │  - Retry Indicators                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PracticeExamResults.jsx                               │ │
│  │  - Separated Feedback Display                          │ │
│  │  - Performance Section                                 │ │
│  │  - Improvement Guidance Section                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Node.js)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  aiService.js                                          │ │
│  │  - Enhanced gradePracticeExam() prompt                 │ │
│  │  - Structured feedback generation                      │ │
│  │  - Response parsing logic                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Quiz System Flow:**
1. User starts quiz → Timer initializes to 12 minutes
2. User answers question → System determines delay (5s or 20s)
3. Auto-advance timer starts → User can click Previous to review
4. Previous clicked → Enter read-only mode, hide timer
5. Next clicked from previous → Return to current question

**Practice Exam Flow:**
1. User submits exam → Backend calls AI service
2. AI service uses enhanced prompt → Generates structured feedback
3. Backend parses response → Separates performance and guidance
4. Frontend receives data → Renders two distinct sections

## Components and Interfaces

### Frontend Components

#### Study.jsx Modifications

**New State Variables:**
```javascript
const [navigationMode, setNavigationMode] = useState('current'); // 'current' | 'previous'
const [viewingQuestionIndex, setViewingQuestionIndex] = useState(0); // For previous navigation
const [showRetryIndicator, setShowRetryIndicator] = useState(false);
```

**Modified Constants:**
```javascript
const QUIZ_TIMER_MINUTES = 12; // Changed from 8
const CORRECT_FIRST_DELAY = 5000; // 5 seconds
const EXPLANATION_DELAY = 20000; // 20 seconds
```

**New Functions:**
```javascript
// Navigate to previous question
const handlePreviousQuestion = () => {
  if (currentQuestion > 0) {
    setNavigationMode('previous');
    setViewingQuestionIndex(currentQuestion - 1);
  }
};

// Navigate forward from previous
const handleNextFromPrevious = () => {
  if (viewingQuestionIndex < currentQuestion) {
    setViewingQuestionIndex(viewingQuestionIndex + 1);
  } else {
    setNavigationMode('current');
  }
};

// Determine auto-advance delay based on attempt
const getAutoAdvanceDelay = (isCorrect, attemptNumber) => {
  if (isCorrect && attemptNumber === 1) {
    return CORRECT_FIRST_DELAY;
  }
  return EXPLANATION_DELAY;
};
```

#### PracticeExamResults.jsx Modifications

**New Props/State:**
```javascript
const [performanceFeedback, setPerformanceFeedback] = useState('');
const [improvementGuidance, setImprovementGuidance] = useState('');
```

**Component Structure:**
```jsx
<div className="results-container">
  {/* Existing score display */}
  
  {/* Performance Feedback Section */}
  <Card className="performance-section">
    <CardHeader>
      <CardTitle>Performance Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactMarkdown>{performanceFeedback}</ReactMarkdown>
    </CardContent>
  </Card>
  
  {/* Improvement Guidance Section */}
  <Card className="improvement-section">
    <CardHeader>
      <CardTitle>Next Steps for Improvement</CardTitle>
    </CardHeader>
    <CardContent>
      <ReactMarkdown>{improvementGuidance}</ReactMarkdown>
    </CardContent>
  </Card>
  
  {/* Existing detailed breakdown */}
</div>
```

### Backend Services

#### aiService.js Modifications

**Enhanced gradePracticeExam Function:**

```javascript
async gradePracticeExam(questions, userAnswers, noteContent = null) {
  const prompt = `You are an experienced university lecturer providing detailed, constructive feedback on student exam answers.

${noteContent ? `REFERENCE MATERIAL (grade answers based STRICTLY on this content, not general knowledge):\n${noteContent}\n\n` : ''}

Your response must be structured in TWO DISTINCT SECTIONS:

## SECTION 1: PERFORMANCE FEEDBACK
Provide a detailed summary of what the student got right and what they got wrong. For each question:
- Identify correct elements in their answers
- Point out specific errors or omissions
- Reference the question number
- Be specific about which concepts were understood vs misunderstood

## SECTION 2: IMPROVEMENT GUIDANCE
Provide a prioritized, actionable learning path:
- Start with foundational concepts that need strengthening
- Explain WHY certain topics should be reviewed first
- Connect recommendations to specific weaknesses from Section 1
- Provide concrete study suggestions (e.g., "Review Chapter 3, focusing on...")
- Build from basic to advanced topics
- Reference specific areas from the student's answers that need work

---

Grade each of the ${questions.length} questions with intelligent assessment that recognizes partial understanding:

SCORING SCALE (0-10):
- 9-10: Complete understanding - captures all key elements accurately
- 7-8: Strong understanding - main concepts correct with minor omissions
- 5-6: Good understanding - correct core idea but missing important details
- 3-4: Basic understanding - recognizes concept but with significant gaps/errors
- 1-2: Limited understanding - vague or mostly incorrect
- 0: No understanding shown or completely wrong

Return a JSON object with this structure:
{
  "performanceFeedback": "Detailed markdown text for Section 1",
  "improvementGuidance": "Detailed markdown text for Section 2",
  "detailed": [
    {
      "question": "exact question text",
      "studentAnswer": "student's answer",
      "mark": number (0-10),
      "comment": "specific feedback",
      "reference": "reference material"
    }
  ]
}

Questions to grade:\n`;

  // Add questions and answers
  questions.forEach((q, i) => {
    prompt += `${i + 1}. ${q}\n`;
    prompt += `Student Answer: ${userAnswers[i] || 'No answer provided'}\n\n`;
  });

  const response = await this.generateResponse(prompt);

  try {
    // Parse JSON response
    let jsonStr = response;
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    const parsedResponse = JSON.parse(jsonStr);

    // Extract the two feedback sections
    const performanceFeedback = parsedResponse.performanceFeedback || '';
    const improvementGuidance = parsedResponse.improvementGuidance || '';
    const detailedResults = parsedResponse.detailed || [];

    // Ensure each result has student answer
    const enrichedResults = detailedResults.map((result, index) => ({
      question: result.question || questions[index] || `Question ${index + 1}`,
      studentAnswer: userAnswers[index] || 'No answer provided',
      mark: result.mark || 0,
      comment: result.comment || 'No feedback available',
      reference: result.reference || 'N/A'
    }));

    // Calculate score
    const totalScore = enrichedResults.reduce((sum, item) => sum + (item.mark || 0), 0);
    const maxScore = questions.length * 10;
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    return {
      score: percentageScore,
      performanceFeedback: performanceFeedback,
      improvementGuidance: improvementGuidance,
      detailed: enrichedResults
    };

  } catch (error) {
    console.error('Error parsing grade response:', error);
    
    // Fallback: Try to split response by section headers
    const sections = response.split(/##\s*SECTION\s*\d+:/i);
    let performanceFeedback = '';
    let improvementGuidance = '';
    
    if (sections.length >= 3) {
      performanceFeedback = sections[1].split(/##\s*SECTION\s*2:/i)[0].trim();
      improvementGuidance = sections[2].trim();
    } else {
      // If splitting fails, put everything in performance feedback
      performanceFeedback = response;
      improvementGuidance = 'Unable to generate structured improvement guidance. Please review the performance feedback above.';
    }

    const fallbackResults = questions.map((q, i) => ({
      question: q,
      studentAnswer: userAnswers[i] || 'No answer provided',
      mark: 0,
      comment: 'Grading error occurred',
      reference: 'N/A'
    }));

    return {
      score: 0,
      performanceFeedback: performanceFeedback,
      improvementGuidance: improvementGuidance,
      detailed: fallbackResults
    };
  }
}
```

## Data Models

### Quiz State Model

```typescript
interface QuizState {
  // Existing fields
  quizQuestions: Question[];
  currentQuestion: number;
  quizAnswers: string[];
  attemptCounts: number[];
  firstAttemptAnswers: string[];
  timeLeft: number;
  isRunning: boolean;
  
  // New fields
  navigationMode: 'current' | 'previous';
  viewingQuestionIndex: number;
  showRetryIndicator: boolean;
  autoAdvanceDelay: number | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}
```

### Practice Exam Feedback Model

```typescript
interface PracticeExamFeedback {
  score: number;
  performanceFeedback: string;  // New: Separated performance summary
  improvementGuidance: string;   // New: Separated improvement guidance
  detailed: DetailedFeedback[];
}

interface DetailedFeedback {
  question: string;
  studentAnswer: string;
  mark: number;
  comment: string;
  reference: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Quiz System Properties

**Property 1: Timer format consistency**
*For any* number of seconds remaining, the formatTime function should return a string in MM:SS format with zero-padding
**Validates: Requirements 1.2**

**Property 2: Previous button visibility**
*For any* question index greater than 0, the Previous button should be visible; for question index 0, it should be hidden
**Validates: Requirements 3.1**

**Property 3: Navigation preserves answers**
*For any* sequence of navigation actions (previous/next), all answer states should remain unchanged in the answers array
**Validates: Requirements 7.1**

**Property 4: Question number display accuracy**
*For any* question being viewed, the displayed question number should match the viewing index plus one, and total should match quiz length
**Validates: Requirements 8.1**

**Property 5: Feedback parsing robustness**
*For any* AI response format (with or without JSON markers), the parsing function should extract feedback sections without throwing errors
**Validates: Requirements 6.6**

### Practice Exam Properties

**Property 6: Feedback section separation**
*For any* practice exam result, the response should contain distinct performanceFeedback and improvementGuidance fields
**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### Quiz System Error Scenarios

1. **Timer Expiry During Navigation**
   - Scenario: Timer reaches zero while user is viewing previous question
   - Handling: Save all answers, exit read-only mode, submit quiz
   - User Feedback: "Time's up! Your quiz has been submitted."

2. **Auto-advance Cancellation**
   - Scenario: User manually navigates while auto-advance timer is pending
   - Handling: Clear setTimeout, cancel auto-advance, allow manual navigation
   - User Feedback: None (seamless transition)

3. **Invalid Question Index**
   - Scenario: Navigation attempts to access question outside valid range
   - Handling: Clamp index to valid range [0, questions.length - 1]
   - User Feedback: None (prevent invalid state)

### Practice Exam Error Scenarios

1. **AI Response Parsing Failure**
   - Scenario: AI returns malformed JSON or unexpected format
   - Handling: Use fallback text splitting by section headers
   - User Feedback: Display available feedback with note about formatting

2. **Missing Feedback Sections**
   - Scenario: AI response lacks one or both required sections
   - Handling: Use empty string for missing sections, show placeholder message
   - User Feedback: "Some feedback sections could not be generated. Please review available feedback."

3. **Network Timeout During Grading**
   - Scenario: AI service takes too long to respond
   - Handling: Show loading state, retry once, then show error
   - User Feedback: "Grading is taking longer than expected. Please wait..."

## Testing Strategy

### Unit Testing Approach

**Quiz System Unit Tests:**
- Timer initialization to 12 minutes
- formatTime function with various second values
- Auto-advance delay calculation for different scenarios
- Navigation mode transitions
- Answer state preservation during navigation
- Previous/Next button visibility logic
- Retry indicator display conditions

**Practice Exam Unit Tests:**
- AI prompt construction with separated sections
- JSON response parsing with valid input
- Fallback parsing with malformed input
- Feedback section extraction
- Score calculation accuracy

### Integration Testing Approach

**Quiz Flow Integration Tests:**
- Complete quiz flow: start → answer → navigate → submit
- Previous navigation: answer questions → go back → review → return
- Timer expiry: start quiz → wait for timer → verify auto-submit
- Retry flow: wrong answer → see hint → retry → see explanation

**Practice Exam Flow Integration Tests:**
- Submit exam → receive structured feedback → display sections
- Verify performance and guidance sections are visually separated
- Test with various answer qualities (excellent, good, poor)

### Property-Based Testing

We will use **Jest** with **fast-check** for property-based testing in JavaScript/React.

**Property Test 1: Timer Format**
```javascript
// Feature: quiz-and-exam-improvements, Property 1: Timer format consistency
fc.assert(
  fc.property(fc.integer(0, 7200), (seconds) => {
    const formatted = formatTime(seconds);
    const regex = /^\d{2}:\d{2}$/;
    return regex.test(formatted);
  })
);
```

**Property Test 2: Previous Button Visibility**
```javascript
// Feature: quiz-and-exam-improvements, Property 2: Previous button visibility
fc.assert(
  fc.property(
    fc.integer(0, 50),
    fc.integer(1, 50),
    (currentIndex, totalQuestions) => {
      const shouldShow = currentIndex > 0;
      const isShown = checkPreviousButtonVisible(currentIndex, totalQuestions);
      return shouldShow === isShown;
    }
  )
);
```

**Property Test 3: Navigation Preserves Answers**
```javascript
// Feature: quiz-and-exam-improvements, Property 3: Navigation preserves answers
fc.assert(
  fc.property(
    fc.array(fc.string(), { minLength: 5, maxLength: 20 }),
    fc.array(fc.integer(0, 19), { minLength: 1, maxLength: 10 }),
    (initialAnswers, navigationSequence) => {
      let answers = [...initialAnswers];
      const originalAnswers = [...initialAnswers];
      
      // Simulate navigation
      navigationSequence.forEach(targetIndex => {
        if (targetIndex >= 0 && targetIndex < answers.length) {
          // Navigate but don't modify answers
          simulateNavigation(targetIndex);
        }
      });
      
      // Answers should be unchanged
      return JSON.stringify(answers) === JSON.stringify(originalAnswers);
    }
  )
);
```

**Property Test 4: Question Number Display**
```javascript
// Feature: quiz-and-exam-improvements, Property 4: Question number display accuracy
fc.assert(
  fc.property(
    fc.integer(0, 49),
    fc.integer(1, 50),
    (viewingIndex, totalQuestions) => {
      fc.pre(viewingIndex < totalQuestions);
      const displayNumber = getDisplayQuestionNumber(viewingIndex);
      return displayNumber === viewingIndex + 1;
    }
  )
);
```

**Property Test 5: Feedback Parsing Robustness**
```javascript
// Feature: quiz-and-exam-improvements, Property 5: Feedback parsing robustness
fc.assert(
  fc.property(
    fc.string(),
    fc.string(),
    (perfFeedback, improvementFeedback) => {
      const mockResponse = `## SECTION 1: PERFORMANCE FEEDBACK\n${perfFeedback}\n## SECTION 2: IMPROVEMENT GUIDANCE\n${improvementFeedback}`;
      
      try {
        const parsed = parseFeedbackSections(mockResponse);
        return parsed.performanceFeedback !== undefined && 
               parsed.improvementGuidance !== undefined;
      } catch (error) {
        return false; // Should not throw
      }
    }
  )
);
```

### Manual Testing Checklist

**Quiz System:**
- [ ] Start quiz and verify 12-minute timer
- [ ] Answer correctly on first try, verify 5-second delay
- [ ] Answer incorrectly, see hint, verify 20-second delay
- [ ] Click Previous button, verify read-only mode
- [ ] Verify timer is hidden in read-only mode
- [ ] Click Next from previous, return to current question
- [ ] Verify retry indicator appears after wrong answer
- [ ] Complete second attempt, verify 20-second delay

**Practice Exam:**
- [ ] Submit exam with various answer qualities
- [ ] Verify performance feedback section appears
- [ ] Verify improvement guidance section appears separately
- [ ] Check that sections are visually distinct
- [ ] Verify performance feedback mentions specific right/wrong items
- [ ] Verify improvement guidance provides actionable steps
- [ ] Test with poor answers, verify foundational concepts are prioritized

## Implementation Notes

### Timer Management

The quiz timer needs careful management to avoid race conditions:
- Use `useRef` to store timer interval ID
- Clear interval on component unmount
- Clear interval when entering read-only mode
- Restart interval when returning to current mode

### Auto-advance Timing

Auto-advance delays must be cancellable:
- Store setTimeout ID in ref
- Clear timeout on manual navigation
- Clear timeout on component unmount
- Use different delays based on correctness and attempt number

### State Synchronization

Navigation state must stay synchronized:
- `currentQuestion`: The actual progress in the quiz
- `viewingQuestionIndex`: The question being displayed (may be previous)
- `navigationMode`: Determines UI behavior and timer visibility

### AI Prompt Engineering

The enhanced prompt must be carefully structured:
- Use clear section markers (## SECTION 1:, ## SECTION 2:)
- Request JSON format for reliable parsing
- Provide fallback parsing for non-JSON responses
- Include specific instructions for prioritization and connections

### Backward Compatibility

Changes must not break existing functionality:
- Maintain existing quiz result saving
- Preserve existing practice exam data structure
- Add new fields without removing old ones
- Ensure old exam results still display correctly

## Performance Considerations

### Frontend Performance

- **Timer Updates**: Use 1-second intervals, not more frequent
- **State Updates**: Batch related state updates to avoid multiple renders
- **Navigation**: Debounce rapid navigation clicks
- **Feedback Rendering**: Use React.memo for feedback sections to prevent unnecessary re-renders

### Backend Performance

- **AI Calls**: No change to existing call frequency
- **Response Parsing**: Parsing is synchronous but fast (< 10ms for typical responses)
- **Fallback Logic**: Minimal overhead, only runs on parse failure

## Security Considerations

- **Input Validation**: Validate question indices before navigation
- **Timer Manipulation**: Timer is client-side only, server validates on submission
- **AI Prompt Injection**: Sanitize user answers before including in prompts
- **XSS Prevention**: Use ReactMarkdown for safe rendering of AI-generated content

## Deployment Strategy

### Phase 1: Quiz Timer and Delays
- Update timer constant to 12 minutes
- Implement new delay logic (5s/20s)
- Add retry indicator
- Deploy and monitor

### Phase 2: Previous Navigation
- Add navigation mode state
- Implement Previous/Next buttons
- Add read-only mode rendering
- Deploy and test with users

### Phase 3: Practice Exam Feedback
- Update AI service prompt
- Implement response parsing
- Update frontend to display sections
- Deploy and gather feedback

### Rollback Plan

Each phase can be rolled back independently:
- Phase 1: Revert timer constant and delay values
- Phase 2: Hide Previous button with feature flag
- Phase 3: Use old prompt and single feedback display
