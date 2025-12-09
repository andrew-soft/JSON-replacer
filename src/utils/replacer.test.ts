import { replaceDogWithCat, ReplacementLimitExceededError, CircularReferenceError, MaxDepthExceededError } from './replacer';

describe('replaceDogWithCat', () => {
  describe('Core logic', () => {
    it('should replace string "dog" with "cat"', () => {
      const result = replaceDogWithCat('dog', 100);
      expect(result.data).toBe('cat');
      expect(result.replacementCount).toBe(1);
    });

    it('should not replace other strings', () => {
      const result = replaceDogWithCat('puppy', 100);
      expect(result.data).toBe('puppy');
      expect(result.replacementCount).toBe(0);
    });

    it('should not replace "dog" as part of a larger string', () => {
      const result = replaceDogWithCat('hotdog', 100);
      expect(result.data).toBe('hotdog');
      expect(result.replacementCount).toBe(0);
    });

    it('should handle null values', () => {
      const result = replaceDogWithCat(null, 100);
      expect(result.data).toBeNull();
      expect(result.replacementCount).toBe(0);
    });

    it('should handle undefined values', () => {
      const result = replaceDogWithCat(undefined, 100);
      expect(result.data).toBeUndefined();
      expect(result.replacementCount).toBe(0);
    });

    it('should handle numbers', () => {
      const result = replaceDogWithCat(42, 100);
      expect(result.data).toBe(42);
      expect(result.replacementCount).toBe(0);
    });

    it('should handle booleans', () => {
      expect(replaceDogWithCat(true, 100).data).toBe(true);
      expect(replaceDogWithCat(false, 100).data).toBe(false);
    });
  });

  describe('Arrays', () => {
    it('should replace "dog" in array elements', () => {
      const input = ['dog', 'puppy', 'dog'];
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual(['cat', 'puppy', 'cat']);
      expect(result.replacementCount).toBe(2);
    });

    it('should handle empty arrays', () => {
      const result = replaceDogWithCat([], 100);
      expect(result.data).toEqual([]);
      expect(result.replacementCount).toBe(0);
    });

    it('should handle arrays with mixed types', () => {
      const input = ['dog', 42, true, null, 'dog'];
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual(['cat', 42, true, null, 'cat']);
      expect(result.replacementCount).toBe(2);
    });

    it('should handle nested arrays', () => {
      const input = [['dog'], ['puppy', 'dog']];
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual([['cat'], ['puppy', 'cat']]);
      expect(result.replacementCount).toBe(2);
    });
  });

  describe('Objects', () => {
    it('should replace "dog" in object values', () => {
      const input = { pet: 'dog', name: 'Max' };
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual({ pet: 'cat', name: 'Max' });
      expect(result.replacementCount).toBe(1);
    });

    it('should handle empty objects', () => {
      const result = replaceDogWithCat({}, 100);
      expect(result.data).toEqual({});
      expect(result.replacementCount).toBe(0);
    });

    it('should handle objects with mixed types', () => {
      const input = {
        pet: 'dog',
        age: 5,
        active: true,
        tags: null,
        friend: 'dog',
      };
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual({
        pet: 'cat',
        age: 5,
        active: true,
        tags: null,
        friend: 'cat',
      });
      expect(result.replacementCount).toBe(2);
    });

    it('should not replace "dog" in object keys', () => {
      const input = { dog: 'pet', cat: 'animal' };
      const result = replaceDogWithCat(input, 100);
      expect(result.data).toEqual({ dog: 'pet', cat: 'animal' });
      expect(result.replacementCount).toBe(0);
    });
  });

  describe('Deeply nested structures', () => {
    it('should handle deeply nested objects', () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                pet: 'dog',
              },
            },
          },
        },
      };
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any).level1.level2.level3.level4.pet).toBe('cat');
      expect(result.replacementCount).toBe(1);
    });

    it('should handle deeply nested arrays', () => {
      const input = [[[['dog']]]];
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any)[0][0][0][0]).toBe('cat');
      expect(result.replacementCount).toBe(1);
    });

    it('should handle complex nested structures', () => {
      const input = {
        animals: [
          { type: 'dog', name: 'Max' },
          { type: 'cat', name: 'Fluffy' },
        ],
        metadata: {
          count: 2,
          favorite: 'dog',
        },
      };
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any).animals[0].type).toBe('cat');
      expect((result.data as any).animals[1].type).toBe('cat'); // Original 'cat' value unchanged
      expect((result.data as any).metadata.favorite).toBe('cat');
      expect(result.replacementCount).toBe(2); // Two 'dog' values replaced
    });

    it('should handle very deep nesting (20 levels)', () => {
      let input: any = 'dog';
      for (let i = 0; i < 20; i++) {
        input = { nested: input };
      }
      const result = replaceDogWithCat(input, 100);
      let current: any = result.data;
      for (let i = 0; i < 20; i++) {
        current = current.nested;
      }
      expect(current).toBe('cat');
      expect(result.replacementCount).toBe(1);
    });

    it('should throw error when maximum depth is exceeded', () => {
      let input: any = 'dog';
      for (let i = 0; i < 110; i++) {
        input = { nested: input };
      }
      expect(() => replaceDogWithCat(input, 200)).toThrow(MaxDepthExceededError);
    });

    it('should handle depth up to the default limit', () => {
      let input: any = 'dog';
      for (let i = 0; i < 50; i++) {
        input = { nested: input };
      }
      const result = replaceDogWithCat(input, 100);
      expect(result.replacementCount).toBe(1);
    });
  });

  describe('Replacement limits', () => {
    it('should allow replacements up to the limit', () => {
      const input = Array(100).fill('dog');
      const result = replaceDogWithCat(input, 100);
      expect(result.replacementCount).toBe(100);
      expect((result.data as string[]).every((val) => val === 'cat')).toBe(true);
    });

    it('should throw error when limit is exceeded', () => {
      const input = Array(101).fill('dog');
      expect(() => replaceDogWithCat(input, 100)).toThrow(ReplacementLimitExceededError);
    });

    it('should throw error with correct replacement count', () => {
      const input = Array(101).fill('dog');
      try {
        replaceDogWithCat(input, 100);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ReplacementLimitExceededError);
        if (error instanceof ReplacementLimitExceededError) {
          expect(error.replacementCount).toBe(101);
          expect(error.limit).toBe(100);
        }
      }
    });

    it('should handle limit of 1', () => {
      const input = ['dog', 'dog'];
      expect(() => replaceDogWithCat(input, 1)).toThrow(ReplacementLimitExceededError);
    });

    it('should handle limit of 0', () => {
      const input = 'dog';
      expect(() => replaceDogWithCat(input, 0)).toThrow(ReplacementLimitExceededError);
    });
  });

  describe('Edge cases', () => {
    it('should handle objects with array values containing "dog"', () => {
      const input = { pets: ['dog', 'cat', 'dog'] };
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any).pets).toEqual(['cat', 'cat', 'cat']);
      expect(result.replacementCount).toBe(2); // Two 'dog' strings replaced, 'cat' unchanged
    });

    it('should handle arrays with object values containing "dog"', () => {
      const input = [{ pet: 'dog' }, { pet: 'cat' }, { pet: 'dog' }];
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any)[0].pet).toBe('cat');
      expect((result.data as any)[1].pet).toBe('cat'); // Original 'cat' value unchanged
      expect((result.data as any)[2].pet).toBe('cat');
      expect(result.replacementCount).toBe(2);
    });

    it('should handle Date objects (should not process)', () => {
      const date = new Date();
      const input = { timestamp: date, pet: 'dog' };
      const result = replaceDogWithCat(input, 100);
      expect((result.data as any).pet).toBe('cat');
      // Date objects are converted to empty objects by JSON serialization
      expect(result.replacementCount).toBe(1);
    });

    it('should detect and throw error for circular references', () => {
      const input: any = { pet: 'dog' };
      input.self = input;
      expect(() => replaceDogWithCat(input, 100)).toThrow(CircularReferenceError);
    });

    it('should detect circular references in arrays', () => {
      const input: any = ['dog'];
      input.push(input);
      expect(() => replaceDogWithCat(input, 100)).toThrow(CircularReferenceError);
    });

    it('should detect circular references in nested structures', () => {
      const input: any = { level1: { pet: 'dog' } };
      input.level1.circular = input;
      expect(() => replaceDogWithCat(input, 100)).toThrow(CircularReferenceError);
    });

    it('should handle very large arrays', () => {
      const input = Array(10000).fill('puppy');
      input[5000] = 'dog';
      const result = replaceDogWithCat(input, 100);
      expect(result.replacementCount).toBe(1);
      expect((result.data as string[])[5000]).toBe('cat');
    });

    it('should handle objects with many keys', () => {
      const input: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        input[`key${i}`] = i === 500 ? 'dog' : 'value';
      }
      const result = replaceDogWithCat(input, 100);
      expect(result.replacementCount).toBe(1);
      expect((result.data as Record<string, string>).key500).toBe('cat');
    });
  });
});

