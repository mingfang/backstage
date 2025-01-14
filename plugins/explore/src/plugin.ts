/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { exploreToolsConfigRef } from '@backstage/plugin-explore-react';
import { catalogEntityRouteRef, exploreRouteRef } from './routes';
import { configApiRef, createApiFactory, createPlugin } from '@backstage/core-plugin-api';

export const explorePlugin = createPlugin({
  id: 'explore',
  apis: [
    // Register a default for exploreToolsConfigRef, you may want to override
    // the API locally in your app.
    createApiFactory({
      api: exploreToolsConfigRef,
      deps: {
        configApi: configApiRef,
      },
      factory: ({ configApi }) => ({
        async getTools() {
          const toolsConfig = configApi.getOptionalConfigArray('explore.tools')
            ?.map(c => {
              return {
                title: c.getString('title'),
                description: c.getString('description'),
                url: c.getString('url'),
                image: c.getString('image'),
                tags: c.getOptionalStringArray('tags') || [],
              };
            }) ?? [];
          return toolsConfig;
        },
      }),
    }),
  ],
  routes: {
    explore: exploreRouteRef,
  },
  externalRoutes: {
    catalogEntity: catalogEntityRouteRef,
  },
});
