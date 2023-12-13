import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../generator-constants.js';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../java/support/index.js';

export const feignFiles = {
  microserviceFeignFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/FeignConfiguration.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'client/AuthorizationHeaderUtil.java',
        'client/AuthorizedFeignClient.java',
        'client/OAuth2InterceptedFeignConfiguration.java',
        'client/TokenRelayRequestInterceptor.java',
        'client/OAuthIdpTokenResponseDTO.java',
      ],
    },
    {
      condition: generator => generator.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['client/UserFeignClientInterceptor_jwt.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['client/AuthorizationHeaderUtilTest.java'],
    },
  ],
};
