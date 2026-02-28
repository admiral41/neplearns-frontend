// components/quiz/QuestionRenderer.js
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function QuestionRenderer({ question, answer, onChange }) {
    const handleSingleChoice = (value) => {
        onChange({
            selectedOption: value,
            selectedOptions: [],
            answer: [value]
        });
    };

    const handleMultipleChoice = (optionId) => {
        const currentOptions = answer?.selectedOptions || [];
        const newOptions = currentOptions.includes(optionId)
            ? currentOptions.filter(id => id !== optionId)
            : [...currentOptions, optionId];
        
        onChange({
            selectedOptions: newOptions,
            answer: newOptions
        });
    };

    const handleTextAnswer = (value) => {
        onChange({
            answer: [value]
        });
    };

    switch (question.questionType) {
        case 'single_choice':
            return (
                <RadioGroup
                    value={answer?.selectedOption || ''}
                    onValueChange={handleSingleChoice}
                    className="space-y-3"
                >
                    {question.options?.map((option, index) => (
                        <div key={option._id} className="flex items-center space-x-3">
                            <RadioGroupItem value={option._id} id={`opt-${option._id}`} />
                            <Label
                                htmlFor={`opt-${option._id}`}
                                className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-500">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    <span>{option.text}</span>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            );

        case 'multiple_choice':
            return (
                <div className="space-y-3">
                    {question.options?.map((option, index) => (
                        <div key={option._id} className="flex items-center space-x-3">
                            <Checkbox
                                id={`opt-${option._id}`}
                                checked={answer?.selectedOptions?.includes(option._id) || false}
                                onCheckedChange={() => handleMultipleChoice(option._id)}
                            />
                            <Label
                                htmlFor={`opt-${option._id}`}
                                className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-500">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    <span>{option.text}</span>
                                </div>
                            </Label>
                        </div>
                    ))}
                </div>
            );

        case 'short_answer':
            return (
                <div className="space-y-2">
                    <Label htmlFor="short-answer">Your Answer</Label>
                    <Input
                        id="short-answer"
                        value={answer?.answer?.[0] || ''}
                        onChange={(e) => handleTextAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                    />
                </div>
            );

        case 'essay':
            return (
                <div className="space-y-2">
                    <Label htmlFor="essay-answer">Your Answer</Label>
                    <Textarea
                        id="essay-answer"
                        value={answer?.answer?.[0] || ''}
                        onChange={(e) => handleTextAnswer(e.target.value)}
                        placeholder="Write your detailed answer here..."
                        rows={6}
                        className="resize-y"
                    />
                </div>
            );

        default:
            return <div>Unknown question type</div>;
    }
}