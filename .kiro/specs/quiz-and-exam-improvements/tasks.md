# Implementation Plan

- [x] 1. Update quiz timer configuration



  - Change QUIZ_TIMER_MINUTES constant from 8 to 10 in Study.jsx
  - Update all timer initialization calls to use 10 * 60 seconds
  - Verify timer display shows correct initial value
  - _Requirements: 1.1, 1.2, 1.4_

- [ ]* 1.1 Write property test for timer format
  - **Property 1: Timer format consistency**
  - **Validates: Requirements 1.2**

- [x] 2. Implement dynamic auto-advance delays



  - Create getAutoAdvanceDelay() function that returns 5000ms for correct first attempts and 20000ms for explanations
  - Update handleQuizAnswer() to use dynamic delay instead of hardcoded 12000ms
  - Modify timeout logic to apply correct delay based on attempt count and correctness
  - Test with correct first answer (should wait 5s)
  - Test with incorrect answer showing explanation (should wait 20s)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_




- [ ] 3. Add retry indicator UI
  - Create showRetryIndicator state variable
  - Add conditional rendering for "Try Again" or "Second Try" message
  - Position indicator near the hint display area
  - Style with encouraging, attention-grabbing design

  - Show indicator when attemptCounts[currentQuestion] === 1 and first answer was wrong
  - Hide indicator when attemptCounts[currentQuestion] === 2
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement previous question navigation




  - Add navigationMode state ('current' | 'previous')
  - Add viewingQuestionIndex state for tracking which question is displayed
  - Create handlePreviousQuestion() function to navigate backward
  - Create handleNextFromPrevious() function to navigate forward
  - Add Previous button that shows when currentQuestion > 0
  - Add Next button that shows in previous mode
  - Update question display to use viewingQuestionIndex when in previous mode
  - _Requirements: 3.1, 3.2, 3.7, 3.8_

- [ ]* 4.1 Write property test for previous button visibility
  - **Property 2: Previous button visibility**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Write property test for navigation answer preservation
  - **Property 3: Navigation preserves answers**
  - **Validates: Requirements 7.1**

- [x] 5. Implement read-only mode for previous questions

  - Add conditional rendering based on navigationMode === 'previous'
  - Hide timer display when in read-only mode
  - Disable answer option buttons when in read-only mode
  - Display all question elements: question text, options, student's answer, hint, explanation
  - Add visual indicator that question has been answered
  - Ensure no auto-advance timers run in read-only mode
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 8.2_

- [x] 6. Enhance state management for navigation


  - Update handleQuizAnswer() to save current answer before any navigation
  - Clear answerTimeoutRef when manual navigation occurs
  - Clear scheduledAdvanceRef when entering previous mode
  - Preserve all answer arrays (quizAnswers, attemptCounts, firstAttemptAnswers) during navigation
  - Restore correct question state when returning from previous mode
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ]* 6.1 Write property test for question number display
  - **Property 4: Question number display accuracy**
  - **Validates: Requirements 8.1**

- [ ] 7. Update practice exam AI prompt in aiService.js
  - Modify gradePracticeExam() function to use enhanced prompt structure
  - Add clear section markers: "## SECTION 1: PERFORMANCE FEEDBACK" and "## SECTION 2: IMPROVEMENT GUIDANCE"
  - Include instructions for AI to detail what student got right and wrong in Section 1
  - Include instructions for AI to provide prioritized, actionable learning path in Section 2
  - Request JSON response format with performanceFeedback and improvementGuidance fields
  - Maintain existing detailed array structure for per-question feedback
  - _Requirements: 5.4, 5.5, 5.6, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Implement feedback response parsing
  - Update gradePracticeExam() to parse JSON response and extract performanceFeedback and improvementGuidance
  - Add fallback parsing logic that splits by section headers if JSON parsing fails
  - Handle missing sections gracefully with placeholder messages
  - Return updated response object with separated feedback fields
  - Maintain backward compatibility with existing detailed array
  - _Requirements: 6.6, 6.7_

- [ ]* 8.1 Write property test for feedback parsing robustness
  - **Property 5: Feedback parsing robustness**
  - **Validates: Requirements 6.6**

- [ ] 9. Update PracticeExamResults.jsx to display separated feedback
  - Add state variables for performanceFeedback and improvementGuidance
  - Create new Card component for "Performance Summary" section
  - Create new Card component for "Next Steps for Improvement" section
  - Position performance section before improvement section
  - Use distinct visual styling for each section (different colors or icons)
  - Render feedback using ReactMarkdown for proper formatting
  - Maintain existing detailed breakdown section below the new sections
  - _Requirements: 5.1, 5.2, 5.3, 5.9_

- [ ]* 9.1 Write unit tests for feedback section rendering
  - Test that performance section renders when performanceFeedback is provided
  - Test that improvement section renders when improvementGuidance is provided
  - Test that sections are visually separated (different container elements)
  - _Requirements: 5.2, 5.3, 5.9_

- [ ] 10. Add visual improvements to quiz UI
  - Ensure question number and total are always visible
  - Add consistent styling to Previous button matching existing navigation controls
  - Add visual indicator for read-only mode (e.g., "Reviewed" badge)
  - Style retry indicator with distinct color and icon
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 12. Write integration tests for quiz flow
  - Test complete quiz flow: start → answer → auto-advance → submit
  - Test previous navigation: answer → go back → review → return
  - Test timer expiry: start → wait for timer → verify auto-submit
  - Test retry flow: wrong answer → hint → retry → explanation
  - _Requirements: All quiz requirements_

- [ ]* 13. Write integration tests for practice exam flow
  - Test exam submission with structured feedback response
  - Test feedback parsing with valid JSON
  - Test feedback parsing with malformed response (fallback)
  - Test UI rendering of separated sections
  - _Requirements: All practice exam requirements_

- [x] 14. Reduce quiz question count to 10



  - Update the quiz generation prompt in backend/routes/ai.js to request 10 questions instead of 15
  - Change all instances of "15" to "10" in the prompt text
  - Verify the prompt instructions are consistent with the new count
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 14.1 Write property test for quiz length consistency
  - **Property 6: Quiz length consistency**
  - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 15. Manual testing and refinement
  - Test quiz with 12-minute timer in real-time
  - Verify 5-second delay feels appropriate for correct answers
  - Verify 20-second delay provides enough reading time for explanations
  - Test previous navigation with multiple back-and-forth movements
  - Test practice exam with various answer qualities
  - Verify feedback sections are clearly separated and readable
  - Gather user feedback on retry indicator clarity
  - Verify quiz generates exactly 10 questions
  - _Requirements: All requirements_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
