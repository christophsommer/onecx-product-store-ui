/**
 * onecx-product-store-bff
 * Backend-For-Frontend (BFF) service for onecx product store.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: onecx@1000kit.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

export interface ProductAbstract {
  /**
   * technical id for a product (unique). Can be used to fetch further product details.
   */
  id: string;
  /**
   * business key for identifying product
   */
  name: string;
  /**
   * textual description for a product.
   */
  description?: string;
  /**
   * product image as url.
   */
  imageUrl?: string;
  /**
   * name of the product used for displaying to user.
   */
  displayName?: string;
}
