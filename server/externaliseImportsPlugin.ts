export const externaliseImportsPlugin = () => ({
   name: 'externalize',
   setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
         // if (args.path === '@schema-types') {
         //    return {
         //       path: './sample-types',
         //       external: true,
         //    };
         // }

         // if (args.path === 'kysely') {
         return {
            path: args.path,
            external: true
         }
         // }

         return {
            errors: [{
               text: `Illegal import: "${args.path}"`,
               detail: 'The only allowed imports are: [@schema-types]',
            }],
         };
      });
   },
});