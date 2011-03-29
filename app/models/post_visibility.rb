#   Copyright (c) 2010, Diaspora Inc.  This file is
#   licensed under the Affero General Public License version 3 or later.  See
#   the COPYRIGHT file.

class PostVisibility < ActiveRecord::Base

  belongs_to :contact
  validates_presence_of :contact

  belongs_to :post
  validates_presence_of :post

end
